import { PrismaClient, Prisma } from "../src/db/generated/prisma/";
import { StorageObjectSource } from "../src/lib/constants";
import { JsonObject } from "../src/types/json";
import * as fs from 'fs';
import * as path from 'path';

// 复制必要的工具函数避免导入问题
function getMediaType(mimeType: string): 'image' | 'video' | 'audio' | 'document' | 'other' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('application/pdf') || 
      mimeType.startsWith('text/') || 
      mimeType.includes('document') ||
      mimeType.includes('word') ||
      mimeType.includes('excel') ||
      mimeType.includes('powerpoint')) return 'document';
  return 'other';
}

function calculateRatio(width: number, height: number): { w: number; h: number } {
  if (width === 0 || height === 0) {
    return { w: 1, h: 1 };
  }
  
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  
  return {
    w: width / divisor,
    h: height / divisor
  };
}

const prisma = new PrismaClient();

interface UpdateOptions {
  dryRun?: boolean;
  confidence?: 'high' | 'medium' | 'low';
  batchSize?: number;
  filter?: {
    mediaType?: string;
    hasMetadata?: boolean;
    filePattern?: string;
  };
}

/**
 * 智能推测文件元数据
 */
function guessMetadata(obj: {
  id: string;
  originName: string;
  type: string;
  size: number;
  metadata: any;
  userId?: string | null;
  createdAt: Date;
  key: string;
}): {
  metadata: JsonObject;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string[];
} {
  const reasoning: string[] = [];
  const metadata: JsonObject = {};
  let confidence: 'high' | 'medium' | 'low' = 'medium';

  // 1. 基础信息推测
  const fileName = obj.originName.toLowerCase();
  const mediaType = getMediaType(obj.type);
  
  // 2. 推测来源 (source)
  if (fileName.includes('generated') || 
      fileName.includes('task_') || 
      fileName.includes('fal_') || 
      fileName.includes('openai_') ||
      fileName.includes('kling_') ||
      fileName.includes('flux_') ||
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(fileName)) {
    metadata.source = StorageObjectSource.USER_GENERATED;
    reasoning.push('文件名包含生成标识或UUID，推测为用户生成内容');
    confidence = 'high';
  } else {
    metadata.source = StorageObjectSource.USER_UPLOAD;
    reasoning.push('推测为用户上传内容');
  }

  // 3. 推测是否为原始文件
  if (fileName.includes('original') || fileName.includes('_original_')) {
    metadata.isOriginal = true;
    metadata.isProcessed = false;
    reasoning.push('文件名包含original标识');
    confidence = 'high';
  } else if (fileName.includes('compressed') || 
             fileName.includes('_comp') || 
             fileName.endsWith('.avif') ||
             fileName.includes('processed') ||
             fileName.includes('converted')) {
    metadata.isOriginal = false;
    metadata.isProcessed = true;
    reasoning.push('文件名包含处理标识');
    confidence = 'high';
  } else {
    // 根据文件大小和类型推测
    if (mediaType === 'image' && obj.size < 100 * 1024) { // 小于100KB的图片可能是压缩过的
      metadata.isOriginal = false;
      metadata.isProcessed = true;
      reasoning.push('图片文件较小，可能是压缩版本');
    } else {
      metadata.isOriginal = true;
      metadata.isProcessed = false;
      reasoning.push('默认推测为原始文件');
    }
  }

  // 4. 从现有元数据提取和规范化信息
  if (obj.metadata) {
    const existing = obj.metadata;
    
    // 检查是否已经是完整的新格式
    const hasNewFormat = existing.isOriginal !== undefined && 
                        existing.source && 
                        (existing.source === StorageObjectSource.USER_GENERATED || existing.source === StorageObjectSource.USER_UPLOAD);
    
    if (hasNewFormat && !existing.is_original && !existing.task_info && !existing.original_width) {
      // 已经是新格式且没有旧字段，可能不需要更新
      confidence = 'low';
      reasoning.push('已经是新格式，可能不需要更新');
    }
    
    // 任务信息提取
    if (existing.task_info && typeof existing.task_info === 'object') {
      metadata.taskInfo = existing.task_info;
      reasoning.push('提取task_info信息');
      metadata.source = StorageObjectSource.USER_GENERATED;
      confidence = 'high';
    } else if (existing.taskId && existing.subTaskId) {
      metadata.taskInfo = {
        taskId: existing.taskId,
        subTaskId: existing.subTaskId
      };
      reasoning.push('合并taskId和subTaskId');
      metadata.source = StorageObjectSource.USER_GENERATED;
      confidence = 'high';
    }

    // 尺寸信息提取
    if (existing.original_width && existing.original_height) {
      metadata.dimensions = {
        width: Number(existing.original_width),
        height: Number(existing.original_height)
      };
      metadata.ratio = calculateRatio(Number(existing.original_width), Number(existing.original_height));
      reasoning.push('提取original_width/height信息');
      confidence = 'high';
    } else if (existing.width && existing.height) {
      metadata.dimensions = {
        width: Number(existing.width),
        height: Number(existing.height)
      };
      metadata.ratio = calculateRatio(Number(existing.width), Number(existing.height));
      reasoning.push('提取width/height信息');
      confidence = 'high';
    }

    // 其他字段规范化
    if (existing.original_url) {
      metadata.originalUrl = existing.original_url;
      reasoning.push('规范化original_url字段');
    }

    if (existing.is_original !== undefined) {
      metadata.isOriginal = Boolean(existing.is_original);
      reasoning.push('规范化is_original字段');
      confidence = 'high';
    }

    if (existing.is_compressed !== undefined) {
      metadata.isCompressed = Boolean(existing.is_compressed);
      reasoning.push('规范化is_compressed字段');
    }

    if (existing.uncompressed_object_id) {
      metadata.uncompressedObjectId = existing.uncompressed_object_id;
      reasoning.push('规范化uncompressed_object_id字段');
    }

    // 保留已经规范化的新格式字段
    const newFormatFields = [
      'ratio', 'compressionQuality', 'duration', 'bitrate', 'dimensions', 
      'taskInfo', 'isOriginal', 'isProcessed', 'isCompressed', 'originalUrl',
      'uncompressedObjectId', 'originalObjectId', 'processedObjectId'
    ];
    
    newFormatFields.forEach(field => {
      if (existing[field] !== undefined && !metadata.hasOwnProperty(field)) {
        metadata[field] = existing[field];
        reasoning.push(`保留现有新格式${field}字段`);
      }
    });

    // 保留其他有用的字段
    const otherFields = ['type', 'size'];
    otherFields.forEach(field => {
      if (existing[field] !== undefined) {
        metadata[field] = existing[field];
        reasoning.push(`保留现有${field}字段`);
      }
    });
  }

  // 5. 根据文件类型添加特定字段
  if (mediaType === 'image') {
    if (obj.type.includes('avif') || fileName.includes('compressed')) {
      metadata.isCompressed = true;
      if (!metadata.compressionQuality) {
        metadata.compressionQuality = 40; // 默认压缩质量
      }
      reasoning.push('图片格式为AVIF或包含压缩标识');
    } else if (!metadata.hasOwnProperty('isCompressed')) {
      metadata.isCompressed = false;
    }
  } else if (mediaType === 'video') {
    if (!metadata.hasOwnProperty('isConverted')) {
      metadata.isConverted = false;
      reasoning.push('视频默认设置为未转换');
    }
  }

  // 6. 设置原始格式
  metadata.originalFormat = obj.type;

  // 7. 根据创建时间推测任务关联
  if (!metadata.taskInfo && metadata.source === StorageObjectSource.USER_GENERATED) {
    // 可以通过创建时间关联最近的任务，但这里暂时跳过
    reasoning.push('用户生成内容但无任务信息');
  }

  // 8. 为没有元数据的文件添加基础推理
  if (!obj.metadata) {
    reasoning.push('文件无元数据，添加基础元数据结构');
    confidence = 'high';
  }

  // 8. 基于文件路径的推测
  if (obj.key.includes('/task/') || obj.key.includes('/generated/')) {
    metadata.source = StorageObjectSource.USER_GENERATED;
    reasoning.push('文件路径包含任务或生成标识');
    confidence = 'high';
  }

  // 9. 文件扩展名特殊处理
  const extension = obj.originName.split('.').pop()?.toLowerCase();
  if (extension === 'avif' || extension === 'webp') {
    metadata.isProcessed = true;
    metadata.isCompressed = true;
    reasoning.push(`${extension}格式通常为压缩格式`);
  }

  return { metadata, confidence, reasoning };
}

/**
 * 更新单个对象的元数据
 */
async function updateObjectMetadata(
  objectId: string, 
  newMetadata: JsonObject,
  options: UpdateOptions
): Promise<boolean> {
  if (options.dryRun) {
    console.log(`[DRY RUN] 将更新对象 ${objectId}`);
    return true;
  }

  try {
    await prisma.ossObject.update({
      where: { id: objectId },
      data: { metadata: newMetadata }
    });
    return true;
  } catch (error) {
    console.error(`更新对象 ${objectId} 失败:`, error);
    return false;
  }
}

/**
 * 从分析文件读取待更新的对象
 */
function loadAnalysisResults(): any[] {
  const analysisFiles = fs.readdirSync('.')
    .filter(file => file.startsWith('oss-metadata-analysis-') && file.endsWith('.json'))
    .sort()
    .reverse(); // 最新的文件在前

  if (analysisFiles.length === 0) {
    console.log('⚠️  未找到分析结果文件，将分析所有对象');
    return [];
  }

  const latestFile = analysisFiles[0];
  console.log(`📂 读取分析结果: ${latestFile}`);
  
  const data = JSON.parse(fs.readFileSync(latestFile, 'utf-8'));
  return data.results || [];
}

async function main() {
  const args = process.argv.slice(2);
  const options: UpdateOptions = {
    dryRun: args.includes('--dry-run'),
    confidence: args.includes('--high-only') ? 'high' : 
                args.includes('--medium-plus') ? 'medium' : undefined,
    batchSize: 50,
    filter: {}
  };

  console.log('🚀 开始更新 OSS 对象元数据');
  console.log(`模式: ${options.dryRun ? '试运行' : '实际更新'}`);
  
  if (options.confidence) {
    console.log(`置信度过滤: ${options.confidence} 及以上`);
  }

  try {
    let objectsToUpdate: any[] = [];
    
    // 尝试从分析结果文件读取
    const analysisResults = loadAnalysisResults();
    if (analysisResults.length > 0) {
      objectsToUpdate = analysisResults;
      console.log(`📊 从分析结果加载了 ${objectsToUpdate.length} 个待更新对象`);
    } else {
      // 如果没有分析结果，直接查询数据库
      console.log('🔍 正在查询所有OSS对象...');
      const allObjects = await prisma.ossObject.findMany({
        orderBy: { createdAt: 'desc' }
      });
      
      console.log(`📋 找到 ${allObjects.length} 个对象，开始分析...`);
      
      for (const obj of allObjects) {
        const analysis = guessMetadata(obj);
        objectsToUpdate.push({
          id: obj.id,
          originName: obj.originName,
          type: obj.type,
          size: obj.size,
          metadata: obj.metadata,
          userId: obj.userId,
          createdAt: obj.createdAt,
          suggestedMetadata: analysis.metadata,
          confidence: analysis.confidence,
          reasoning: analysis.reasoning,
          needsUpdate: true
        });
      }
    }

    // 应用置信度过滤
    if (options.confidence) {
      const confidenceLevels: { [key: string]: number } = { high: 3, medium: 2, low: 1 };
      const minLevel = confidenceLevels[options.confidence];
      
      objectsToUpdate = objectsToUpdate.filter(obj => 
        confidenceLevels[obj.confidence] >= minLevel
      );
      
      console.log(`🎯 置信度过滤后剩余 ${objectsToUpdate.length} 个对象`);
    }

    // 批量更新
    let updated = 0;
    let failed = 0;
    const totalToUpdate = objectsToUpdate.length;

    console.log(`\n📝 开始更新 ${totalToUpdate} 个对象...\n`);

    for (let i = 0; i < totalToUpdate; i += options.batchSize!) {
      const batch = objectsToUpdate.slice(i, i + options.batchSize!);
      console.log(`处理批次 ${Math.floor(i / options.batchSize!) + 1}/${Math.ceil(totalToUpdate / options.batchSize!)} (${batch.length} 个对象)`);

      for (const obj of batch) {
        const success = await updateObjectMetadata(
          obj.id,
          obj.suggestedMetadata,
          options
        );

        if (success) {
          updated++;
          if (updated % 10 === 0 || obj.confidence === 'high') {
            console.log(`  ✅ ${obj.originName} (${obj.confidence}置信度)`);
            if (obj.reasoning.length > 0) {
              console.log(`     推理: ${obj.reasoning.slice(0, 2).join('; ')}`);
            }
          }
        } else {
          failed++;
          console.log(`  ❌ ${obj.originName} - 更新失败`);
        }
      }

      // 添加延迟避免数据库压力
      if (i + options.batchSize! < totalToUpdate) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // 输出统计结果
    console.log('\n' + '='.repeat(60));
    console.log('📊 更新完成统计');
    console.log('='.repeat(60));
    console.log(`总对象数: ${totalToUpdate}`);
    console.log(`成功更新: ${updated}`);
    console.log(`更新失败: ${failed}`);
    console.log(`成功率: ${totalToUpdate > 0 ? ((updated / totalToUpdate) * 100).toFixed(1) : 0}%`);

    if (options.dryRun) {
      console.log('\n💡 这是试运行，没有实际修改数据');
      console.log('   运行 pnpm update-oss-metadata 来执行实际更新');
      console.log('   运行 pnpm update-oss-metadata --high-only 只更新高置信度对象');
    } else {
      console.log('\n✅ 元数据更新完成！');
    }

  } catch (error) {
    console.error('❌ 更新过程中出错:', error);
    process.exit(1);
  }
}

// 处理命令行参数
if (process.argv.includes('--help')) {
  console.log(`
OSS 元数据更新工具

用法:
  pnpm update-oss-metadata [选项]

选项:
  --dry-run        试运行模式，不实际修改数据
  --high-only      只更新高置信度的对象
  --medium-plus    更新中等及高置信度的对象
  --help           显示此帮助信息

示例:
  pnpm update-oss-metadata --dry-run     # 试运行
  pnpm update-oss-metadata --high-only   # 只更新高置信度对象
  pnpm update-oss-metadata               # 更新所有对象
`);
  process.exit(0);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });