import { PrismaClient, Prisma } from "../src/db/generated/prisma/";

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 查询 OSS 数据库现状...\n');

  try {
    // 1. 基本统计
    const totalCount = await prisma.ossObject.count();
    console.log(`📊 总对象数量: ${totalCount}`);
    
    if (totalCount === 0) {
      console.log('❌ 数据库中没有 OSS 对象');
      return;
    }

    // 2. 按 metadata 是否存在分组
    const withMetadata = await prisma.ossObject.count({
      where: { 
        metadata: { 
          not: Prisma.JsonNull 
        } 
      }
    });
    const withoutMetadata = totalCount - withMetadata;
    
    console.log(`📋 元数据状态:`);
    console.log(`   有元数据: ${withMetadata} (${((withMetadata / totalCount) * 100).toFixed(1)}%)`);
    console.log(`   无元数据: ${withoutMetadata} (${((withoutMetadata / totalCount) * 100).toFixed(1)}%)`);

    // 3. 按文件类型统计
    console.log('\n📁 文件类型分布:');
    const typeStats = await prisma.ossObject.groupBy({
      by: ['type'],
      _count: { type: true },
      orderBy: { _count: { type: 'desc' } },
      take: 10
    });

    typeStats.forEach(stat => {
      const percentage = ((stat._count.type / totalCount) * 100).toFixed(1);
      console.log(`   ${stat.type}: ${stat._count.type} (${percentage}%)`);
    });

    // 4. 按用户统计
    const userStats = await prisma.ossObject.groupBy({
      by: ['userId'],
      _count: { userId: true },
      orderBy: { _count: { userId: 'desc' } },
      take: 5
    });

    console.log('\n👥 用户文件分布 (前5名):');
    for (const stat of userStats) {
      if (stat.userId) {
        const user = await prisma.user.findUnique({
          where: { id: stat.userId },
          select: { name: true, email: true }
        });
        const percentage = ((stat._count.userId / totalCount) * 100).toFixed(1);
        console.log(`   ${user?.name || user?.email || stat.userId}: ${stat._count.userId} (${percentage}%)`);
      } else {
        const percentage = ((stat._count.userId / totalCount) * 100).toFixed(1);
        console.log(`   [无用户]: ${stat._count.userId} (${percentage}%)`);
      }
    }

    // 5. 最近的一些记录示例
    console.log('\n📝 最新记录示例 (前5条):');
    const recentObjects = await prisma.ossObject.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        originName: true,
        type: true,
        size: true,
        metadata: true,
        createdAt: true,
        user: {
          select: { name: true, email: true }
        }
      }
    });

    recentObjects.forEach((obj, index) => {
      console.log(`\n   ${index + 1}. ${obj.originName}`);
      console.log(`      ID: ${obj.id}`);
      console.log(`      类型: ${obj.type}`);
      console.log(`      大小: ${(obj.size / 1024).toFixed(1)}KB`);
      console.log(`      用户: ${obj.user?.name || obj.user?.email || '未知'}`);
      console.log(`      创建时间: ${obj.createdAt.toISOString()}`);
      
      if (obj.metadata) {
        const metadata = obj.metadata as any;
        const keys = Object.keys(metadata);
        console.log(`      元数据字段: ${keys.join(', ')}`);
        
        // 显示一些关键字段的值
        if (metadata.source) console.log(`        source: ${metadata.source}`);
        if (metadata.taskInfo || metadata.task_info) console.log(`        任务信息: 有`);
        if (metadata.is_original !== undefined) console.log(`        is_original: ${metadata.is_original}`);
        if (metadata.isOriginal !== undefined) console.log(`        isOriginal: ${metadata.isOriginal}`);
        if (metadata.dimensions || (metadata.original_width && metadata.original_height)) {
          console.log(`        尺寸信息: 有`);
        }
      } else {
        console.log(`      元数据: 无`);
      }
    });

    // 6. 元数据字段分析
    console.log('\n🔍 元数据字段分析:');
    const objectsWithMetadata = await prisma.ossObject.findMany({
      where: { 
        metadata: { 
          not: Prisma.JsonNull 
        } 
      },
      select: { metadata: true },
      take: 100 // 取前100个进行分析
    });

    const fieldCounts: Record<string, number> = {};
    let hasOldFormat = 0;
    let hasNewFormat = 0;

    objectsWithMetadata.forEach(obj => {
      if (obj.metadata) {
        const metadata = obj.metadata as any;
        Object.keys(metadata).forEach(key => {
          fieldCounts[key] = (fieldCounts[key] || 0) + 1;
        });

        // 检查新旧格式
        if (metadata.is_original !== undefined || 
            metadata.task_info !== undefined ||
            metadata.original_width !== undefined) {
          hasOldFormat++;
        }
        if (metadata.isOriginal !== undefined || 
            metadata.taskInfo !== undefined ||
            metadata.dimensions !== undefined) {
          hasNewFormat++;
        }
      }
    });

    console.log('   常见元数据字段:');
    const sortedFields = Object.entries(fieldCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);

    sortedFields.forEach(([field, count]) => {
      const percentage = ((count / objectsWithMetadata.length) * 100).toFixed(1);
      console.log(`     ${field}: ${count} (${percentage}%)`);
    });

    console.log(`\n   格式分析:`);
    console.log(`     旧格式记录: ${hasOldFormat}`);
    console.log(`     新格式记录: ${hasNewFormat}`);
    console.log(`     需要迁移: ${hasOldFormat > 0 ? '是' : '否'}`);

    // 7. 文件大小分析
    const sizeStats = await prisma.ossObject.aggregate({
      _avg: { size: true },
      _max: { size: true },
      _min: { size: true },
      _sum: { size: true }
    });

    console.log('\n📏 文件大小统计:');
    console.log(`   平均大小: ${((sizeStats._avg.size || 0) / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   最大文件: ${((sizeStats._max.size || 0) / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   最小文件: ${((sizeStats._min.size || 0) / 1024).toFixed(2)}KB`);
    console.log(`   总存储: ${((sizeStats._sum.size || 0) / 1024 / 1024 / 1024).toFixed(2)}GB`);

  } catch (error) {
    console.error('❌ 查询过程中出错:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });