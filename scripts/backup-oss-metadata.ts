import { PrismaClient } from "../src/db/generated/prisma/";
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 开始备份 OSS 对象元数据...\n');

  try {
    // 1. 获取所有OSS对象的元数据
    console.log('📋 正在查询所有 OSS 对象...');
    const allObjects = await prisma.ossObject.findMany({
      select: {
        id: true,
        originName: true,
        type: true,
        size: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        userId: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 找到 ${allObjects.length} 个对象`);

    // 2. 创建备份数据结构
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      totalObjects: allObjects.length,
      metadata: {
        withMetadata: allObjects.filter(obj => obj.metadata !== null).length,
        withoutMetadata: allObjects.filter(obj => obj.metadata === null).length
      },
      objects: allObjects.map(obj => ({
        id: obj.id,
        originName: obj.originName,
        type: obj.type,
        size: obj.size,
        metadata: obj.metadata,
        createdAt: obj.createdAt.toISOString(),
        updatedAt: obj.updatedAt.toISOString(),
        userId: obj.userId
      }))
    };

    // 3. 生成备份文件名
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const backupFileName = `oss-metadata-backup-${timestamp}.json`;
    const backupPath = path.resolve(backupFileName);

    // 4. 写入备份文件
    console.log('💾 正在写入备份文件...');
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));

    // 5. 验证备份文件
    const backupSize = fs.statSync(backupPath).size;
    console.log(`✅ 备份完成！`);
    console.log(`   文件路径: ${backupPath}`);
    console.log(`   文件大小: ${(backupSize / 1024).toFixed(2)} KB`);
    console.log(`   对象数量: ${backupData.totalObjects}`);
    console.log(`   有元数据: ${backupData.metadata.withMetadata}`);
    console.log(`   无元数据: ${backupData.metadata.withoutMetadata}`);

    // 6. 创建恢复脚本说明
    const restoreInstructions = `
# OSS 元数据恢复说明

## 备份信息
- 备份时间: ${backupData.timestamp}
- 总对象数: ${backupData.totalObjects}
- 备份文件: ${backupFileName}

## 恢复方法

### 1. 使用 Prisma 恢复
\`\`\`typescript
// 在脚本中使用
const backupData = JSON.parse(fs.readFileSync('${backupFileName}', 'utf-8'));

for (const obj of backupData.objects) {
  await prisma.ossObject.update({
    where: { id: obj.id },
    data: { metadata: obj.metadata }
  });
}
\`\`\`

### 2. 创建恢复脚本
运行: pnpm restore-oss-metadata ${backupFileName}

### 3. 手动SQL恢复（谨慎使用）
从备份文件中提取特定对象的元数据进行恢复。

## 注意事项
- 恢复前请确保数据库状态一致
- 建议在测试环境先验证恢复流程
- 保留此备份文件直到确认更新成功
`;

    const instructionsFileName = `oss-metadata-restore-instructions-${timestamp}.md`;
    fs.writeFileSync(instructionsFileName, restoreInstructions);
    
    console.log(`\n📄 恢复说明已保存到: ${instructionsFileName}`);
    console.log(`\n⚠️  重要提醒:`);
    console.log(`   1. 请保留备份文件直到确认更新成功`);
    console.log(`   2. 建议在执行更新前先试运行`);
    console.log(`   3. 如需恢复，请使用 pnpm restore-oss-metadata ${backupFileName}`);

  } catch (error) {
    console.error('❌ 备份过程中出错:', error);
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