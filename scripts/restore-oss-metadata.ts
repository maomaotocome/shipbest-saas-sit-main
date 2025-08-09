import { PrismaClient } from "../src/db/generated/prisma/";
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface BackupObject {
  id: string;
  originName: string;
  type: string;
  size: number;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  userId: string | null;
}

interface BackupData {
  timestamp: string;
  version: string;
  totalObjects: number;
  metadata: {
    withMetadata: number;
    withoutMetadata: number;
  };
  objects: BackupObject[];
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    console.log(`
OSS 元数据恢复工具

用法:
  pnpm restore-oss-metadata <备份文件名> [选项]

选项:
  --dry-run          试运行模式，不实际修改数据
  --selective <id>   只恢复指定ID的对象
  --help             显示此帮助信息

示例:
  pnpm restore-oss-metadata oss-metadata-backup-2025-07-04T11-00-00.json --dry-run
  pnpm restore-oss-metadata backup.json --selective cmcoq7p93000frxwnmbvs2a8h
`);
    process.exit(0);
  }

  const backupFileName = args[0];
  const isDryRun = args.includes('--dry-run');
  const selectiveId = args.includes('--selective') ? args[args.indexOf('--selective') + 1] : null;

  console.log('🔄 开始恢复 OSS 对象元数据...\n');
  console.log(`备份文件: ${backupFileName}`);
  console.log(`模式: ${isDryRun ? '试运行' : '实际恢复'}`);
  if (selectiveId) {
    console.log(`选择性恢复: ${selectiveId}`);
  }

  try {
    // 1. 验证备份文件
    if (!fs.existsSync(backupFileName)) {
      console.error(`❌ 备份文件不存在: ${backupFileName}`);
      process.exit(1);
    }

    // 2. 读取备份数据
    console.log('📂 正在读取备份文件...');
    const backupData: BackupData = JSON.parse(fs.readFileSync(backupFileName, 'utf-8'));
    
    console.log(`📊 备份信息:`);
    console.log(`   备份时间: ${backupData.timestamp}`);
    console.log(`   版本: ${backupData.version}`);
    console.log(`   总对象数: ${backupData.totalObjects}`);
    console.log(`   有元数据: ${backupData.metadata.withMetadata}`);
    console.log(`   无元数据: ${backupData.metadata.withoutMetadata}`);

    // 3. 过滤需要恢复的对象
    let objectsToRestore = backupData.objects;
    if (selectiveId) {
      objectsToRestore = backupData.objects.filter(obj => obj.id === selectiveId);
      if (objectsToRestore.length === 0) {
        console.error(`❌ 未在备份中找到ID为 ${selectiveId} 的对象`);
        process.exit(1);
      }
    }

    console.log(`\n🎯 准备恢复 ${objectsToRestore.length} 个对象的元数据\n`);

    // 4. 验证对象是否仍存在于数据库中
    const existingIds = new Set();
    if (!isDryRun) {
      console.log('🔍 验证对象是否存在于数据库中...');
      const existingObjects = await prisma.ossObject.findMany({
        where: {
          id: { in: objectsToRestore.map(obj => obj.id) }
        },
        select: { id: true }
      });
      
      existingObjects.forEach(obj => existingIds.add(obj.id));
      
      const missingCount = objectsToRestore.length - existingObjects.length;
      if (missingCount > 0) {
        console.log(`⚠️  警告: ${missingCount} 个对象在当前数据库中不存在`);
      }
    }

    // 5. 执行恢复
    let restored = 0;
    let skipped = 0;
    let failed = 0;

    for (const backupObj of objectsToRestore) {
      try {
        if (!isDryRun && !existingIds.has(backupObj.id)) {
          console.log(`⏭️  跳过 ${backupObj.originName} - 对象不存在于数据库中`);
          skipped++;
          continue;
        }

        if (isDryRun) {
          console.log(`[DRY RUN] 将恢复: ${backupObj.originName}`);
          console.log(`   ID: ${backupObj.id}`);
          console.log(`   元数据: ${backupObj.metadata ? Object.keys(backupObj.metadata).join(', ') : '无'}`);
        } else {
          await prisma.ossObject.update({
            where: { id: backupObj.id },
            data: { metadata: backupObj.metadata }
          });
          console.log(`✅ 已恢复: ${backupObj.originName}`);
        }
        
        restored++;

      } catch (error) {
        console.error(`❌ 恢复失败 ${backupObj.originName}:`, error);
        failed++;
      }

      // 添加延迟避免数据库压力
      if (!isDryRun && restored % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // 6. 输出统计结果
    console.log('\n' + '='.repeat(60));
    console.log('📊 恢复完成统计');
    console.log('='.repeat(60));
    console.log(`总对象数: ${objectsToRestore.length}`);
    console.log(`成功恢复: ${restored}`);
    console.log(`跳过: ${skipped}`);
    console.log(`失败: ${failed}`);
    
    if (isDryRun) {
      console.log('\n💡 这是试运行，没有实际修改数据');
      console.log(`   运行 pnpm restore-oss-metadata ${backupFileName} 来执行实际恢复`);
    } else if (failed === 0) {
      console.log('\n✅ 元数据恢复完成！');
    } else {
      console.log('\n⚠️  恢复完成，但有部分失败，请检查错误日志');
    }

  } catch (error) {
    console.error('❌ 恢复过程中出错:', error);
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