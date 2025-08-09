import { PrismaClient } from "../src/db/generated/prisma/";
import { StorageObjectSource } from "../src/lib/constants";
import { JsonObject } from "../src/types/json";

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

interface AnalysisResult {
  id: string;
  originName: string;
  type: string;
  size: number;
  currentMetadata: JsonObject | null;
  suggestedMetadata: JsonObject;
  needsUpdate: boolean;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string[];
}

/**
 * 从文件名推测信息
 */
function analyzeFileName(originName: string): {
  isOriginal: boolean;
  isProcessed: boolean;
  source: StorageObjectSource;
  reasoning: string[];
} {
  const reasoning: string[] = [];
  let isOriginal = true;
  let isProcessed = false;
  let source = StorageObjectSource.USER_UPLOAD;

  const fileName = originName.toLowerCase();
  
  // 检查是否为压缩/处理后的文件
  if (fileName.includes('compressed') || fileName.includes('_comp') || fileName.endsWith('.avif')) {
    isOriginal = false;
    isProcessed = true;
    reasoning.push('文件名包含压缩标识或为AVIF格式');
  }
  
  if (fileName.includes('original') || fileName.includes('_original_')) {
    isOriginal = true;
    reasoning.push('文件名包含original标识');
  }
  
  // 检查是否为生成的文件
  if (fileName.includes('generated') || fileName.includes('task_') || fileName.includes('fal_') || fileName.includes('openai_')) {
    source = StorageObjectSource.USER_GENERATED;
    reasoning.push('文件名包含生成标识');
  }
  
  // UUID模式检查 (可能是生成的文件)
  const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  if (uuidPattern.test(fileName)) {
    source = StorageObjectSource.USER_GENERATED;
    reasoning.push('文件名包含UUID，可能是系统生成');
  }

  // 如果没有特殊标识，基于文件名模式推测
  if (reasoning.length === 0) {
    if (fileName.includes('微信图片') || fileName.includes('screenshot') || fileName.includes('截屏')) {
      reasoning.push('用户上传的截图或微信图片');
    } else {
      reasoning.push('默认推测为用户上传文件');
    }
  }

  return { isOriginal, isProcessed, source, reasoning };
}

/**
 * 从现有元数据推测补充信息
 */
function analyzeExistingMetadata(metadata: JsonObject): {
  extractedInfo: Partial<JsonObject>;
  reasoning: string[];
} {
  const reasoning: string[] = [];
  const extractedInfo: Partial<JsonObject> = {};

  // 检查任务信息的不同格式
  if (metadata.task_info && typeof metadata.task_info === 'object') {
    extractedInfo.taskInfo = metadata.task_info;
    reasoning.push('发现task_info对象，转换为taskInfo');
  } else if (metadata.taskId && metadata.subTaskId) {
    extractedInfo.taskInfo = {
      taskId: metadata.taskId,
      subTaskId: metadata.subTaskId
    };
    reasoning.push('发现分散的taskId和subTaskId，合并为taskInfo对象');
  }

  // 检查源标识
  if (metadata.source === 'user_generated' || metadata.source === 'user-generated') {
    extractedInfo.source = StorageObjectSource.USER_GENERATED;
    reasoning.push('规范化source字段为枚举值');
  } else if (metadata.source === 'user_upload' || metadata.source === 'user-upload') {
    extractedInfo.source = StorageObjectSource.USER_UPLOAD;
    reasoning.push('规范化source字段为枚举值');
  }

  // 检查尺寸信息的不同格式
  if (metadata.original_width && metadata.original_height) {
    extractedInfo.dimensions = {
      width: metadata.original_width,
      height: metadata.original_height
    };
    reasoning.push('发现original_width/height，转换为dimensions对象');
  } else if (metadata.width && metadata.height) {
    extractedInfo.dimensions = {
      width: metadata.width,
      height: metadata.height
    };
    reasoning.push('发现width/height，转换为dimensions对象');
  }

  // 检查压缩信息
  if (metadata.is_compressed !== undefined) {
    extractedInfo.isCompressed = metadata.is_compressed;
    reasoning.push('规范化is_compressed为isCompressed');
  }

  if (metadata.is_original !== undefined) {
    extractedInfo.isOriginal = metadata.is_original;
    reasoning.push('规范化is_original为isOriginal');
  }

  // 检查原始URL
  if (metadata.original_url) {
    extractedInfo.originalUrl = metadata.original_url;
    reasoning.push('规范化original_url为originalUrl');
  }

  // 检查关联对象ID
  if (metadata.uncompressed_object_id) {
    extractedInfo.uncompressedObjectId = metadata.uncompressed_object_id;
    reasoning.push('规范化uncompressed_object_id为uncompressedObjectId');
  }

  return { extractedInfo, reasoning };
}

/**
 * 生成建议的元数据
 */
function generateSuggestedMetadata(
  obj: any,
  fileAnalysis: ReturnType<typeof analyzeFileName>,
  metadataAnalysis: ReturnType<typeof analyzeExistingMetadata>
): JsonObject {
  const suggested: JsonObject = {
    source: fileAnalysis.source,
    isOriginal: fileAnalysis.isOriginal,
    isProcessed: fileAnalysis.isProcessed,
  };

  // 合并从现有元数据提取的信息
  Object.assign(suggested, metadataAnalysis.extractedInfo);

  // 如果有尺寸信息，计算比例
  if (suggested.dimensions && typeof suggested.dimensions === 'object') {
    const dims = suggested.dimensions as { width: number; height: number };
    if (dims.width && dims.height) {
      suggested.ratio = calculateRatio(dims.width, dims.height);
    }
  }

  // 根据文件类型添加特定字段
  const mediaType = getMediaType(obj.type);
  
  if (mediaType === 'image') {
    if (obj.originName.endsWith('.avif') || obj.originName.includes('compressed')) {
      suggested.isCompressed = true;
      suggested.compressionQuality = 40; // 默认质量
    } else {
      suggested.isCompressed = false;
    }
  } else if (mediaType === 'video') {
    suggested.isConverted = false; // 默认未转换
  }

  // 设置原始格式
  suggested.originalFormat = obj.type;

  return suggested;
}

/**
 * 分析单个OSS对象
 */
async function analyzeOssObject(obj: any): Promise<AnalysisResult> {
  const fileAnalysis = analyzeFileName(obj.originName || '');
  const metadataAnalysis = obj.metadata ? analyzeExistingMetadata(obj.metadata as JsonObject) : { extractedInfo: {}, reasoning: [] };
  
  const suggestedMetadata = generateSuggestedMetadata(obj, fileAnalysis, metadataAnalysis);
  
  // 判断是否需要更新
  const currentMetadata = obj.metadata as JsonObject | null;
  let needsUpdate = false;
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  
  if (!currentMetadata) {
    needsUpdate = true;
    confidence = 'high';
  } else {
    // 检查关键字段是否缺失或格式不对
    const keyFields = ['source', 'isOriginal', 'isProcessed'];
    for (const field of keyFields) {
      if (!currentMetadata[field] && suggestedMetadata[field] !== undefined) {
        needsUpdate = true;
        break;
      }
    }
    
    // 检查是否有旧格式字段需要规范化
    if (currentMetadata.is_original !== undefined || 
        currentMetadata.original_width !== undefined ||
        currentMetadata.task_info !== undefined) {
      needsUpdate = true;
      confidence = 'high';
    }
  }

  const reasoning = [
    ...fileAnalysis.reasoning,
    ...metadataAnalysis.reasoning
  ];

  return {
    id: obj.id,
    originName: obj.originName || '',
    type: obj.type || '',
    size: obj.size || 0,
    currentMetadata,
    suggestedMetadata,
    needsUpdate,
    confidence,
    reasoning
  };
}

async function main() {
  console.log('开始分析 OSS 对象元数据...\n');

  try {
    // 获取所有OSS对象，分批处理
    const batchSize = 100;
    let skip = 0;
    let totalAnalyzed = 0;
    let totalNeedsUpdate = 0;
    const results: AnalysisResult[] = [];

    while (true) {
      const objects = await prisma.ossObject.findMany({
        skip,
        take: batchSize,
        orderBy: { createdAt: 'desc' }
      });

      if (objects.length === 0) break;

      console.log(`正在分析第 ${skip + 1} - ${skip + objects.length} 个对象...`);

      for (const obj of objects) {
        const analysis = await analyzeOssObject(obj);
        results.push(analysis);
        totalAnalyzed++;
        
        if (analysis.needsUpdate) {
          totalNeedsUpdate++;
        }

        // 显示需要更新的对象详情
        if (analysis.needsUpdate && analysis.confidence === 'high') {
          console.log(`\n🔍 高置信度更新: ${analysis.originName}`);
          console.log(`   文件类型: ${analysis.type}`);
          console.log(`   当前元数据: ${analysis.currentMetadata ? Object.keys(analysis.currentMetadata).join(', ') : '无'}`);
          console.log(`   建议元数据字段: ${Object.keys(analysis.suggestedMetadata).join(', ')}`);
          console.log(`   原因: ${analysis.reasoning.join('; ')}`);
        }
      }

      skip += batchSize;
    }

    // 生成统计报告
    console.log('\n' + '='.repeat(60));
    console.log('📊 分析完成统计');
    console.log('='.repeat(60));
    console.log(`总对象数量: ${totalAnalyzed}`);
    console.log(`需要更新: ${totalNeedsUpdate} (${((totalNeedsUpdate / totalAnalyzed) * 100).toFixed(1)}%)`);
    
    const highConfidence = results.filter(r => r.needsUpdate && r.confidence === 'high').length;
    const mediumConfidence = results.filter(r => r.needsUpdate && r.confidence === 'medium').length;
    const lowConfidence = results.filter(r => r.needsUpdate && r.confidence === 'low').length;
    
    console.log(`\n置信度分布:`);
    console.log(`  高置信度: ${highConfidence}`);
    console.log(`  中置信度: ${mediumConfidence}`);
    console.log(`  低置信度: ${lowConfidence}`);

    // 按文件类型统计
    const typeStats: Record<string, { total: number; needsUpdate: number }> = {};
    results.forEach(r => {
      const mediaType = getMediaType(r.type);
      if (!typeStats[mediaType]) {
        typeStats[mediaType] = { total: 0, needsUpdate: 0 };
      }
      typeStats[mediaType].total++;
      if (r.needsUpdate) typeStats[mediaType].needsUpdate++;
    });

    console.log(`\n按文件类型统计:`);
    Object.entries(typeStats).forEach(([type, stats]) => {
      const percentage = ((stats.needsUpdate / stats.total) * 100).toFixed(1);
      console.log(`  ${type}: ${stats.needsUpdate}/${stats.total} (${percentage}%)`);
    });

    // 保存分析结果到JSON文件
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const outputFile = `./oss-metadata-analysis-${timestamp}.json`;
    
    require('fs').writeFileSync(outputFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        totalAnalyzed,
        totalNeedsUpdate,
        highConfidence,
        mediumConfidence,
        lowConfidence,
        typeStats
      },
      results: results.filter(r => r.needsUpdate)
    }, null, 2));

    console.log(`\n💾 分析结果已保存到: ${outputFile}`);
    console.log(`\n✅ 运行以下命令来应用更新:`);
    console.log(`   pnpm update-oss-metadata`);

  } catch (error) {
    console.error('❌ 分析过程中出错:', error);
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