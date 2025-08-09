// 文件上传配置
export const UPLOAD_CONFIG = {
  // 默认文件大小限制 (5MB)
  DEFAULT_MAX_FILE_SIZE: 5 * 1024 * 1024,
  
  // 按文件类型设置不同的大小限制
  FILE_SIZE_LIMITS: {
    // 图片文件 (10MB)
    image: 10 * 1024 * 1024,
    
    // 视频文件 (100MB)
    video: 100 * 1024 * 1024,
    
    // 音频文件 (20MB)
    audio: 20 * 1024 * 1024,
    
    // 文档文件 (10MB)
    document: 10 * 1024 * 1024,
    
    // 其他文件 (5MB)
    other: 5 * 1024 * 1024,
  },
  
  // 支持的文件类型
  SUPPORTED_TYPES: {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'],
    audio: ['audio/mp3', 'audio/wav', 'audio/aac', 'audio/ogg'],
    document: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
} as const;

/**
 * 根据文件类型获取最大文件大小限制
 */
export function getMaxFileSize(fileType: string): number {
  if (fileType.startsWith('image/')) {
    return UPLOAD_CONFIG.FILE_SIZE_LIMITS.image;
  }
  
  if (fileType.startsWith('video/')) {
    return UPLOAD_CONFIG.FILE_SIZE_LIMITS.video;
  }
  
  if (fileType.startsWith('audio/')) {
    return UPLOAD_CONFIG.FILE_SIZE_LIMITS.audio;
  }
  
  if (fileType.startsWith('application/') || fileType.startsWith('text/')) {
    return UPLOAD_CONFIG.FILE_SIZE_LIMITS.document;
  }
  
  return UPLOAD_CONFIG.FILE_SIZE_LIMITS.other;
}

/**
 * 检查文件类型是否支持
 */
export function isSupportedFileType(fileType: string): boolean {
  const allSupportedTypes: readonly string[] = [
    ...UPLOAD_CONFIG.SUPPORTED_TYPES.image,
    ...UPLOAD_CONFIG.SUPPORTED_TYPES.video,
    ...UPLOAD_CONFIG.SUPPORTED_TYPES.audio,
    ...UPLOAD_CONFIG.SUPPORTED_TYPES.document,
  ];
  
  return allSupportedTypes.includes(fileType);
}

/**
 * 格式化文件大小显示
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 获取文件类型类别
 */
export function getFileCategory(fileType: string): 'image' | 'video' | 'audio' | 'document' | 'other' {
  if (fileType.startsWith('image/')) return 'image';
  if (fileType.startsWith('video/')) return 'video';
  if (fileType.startsWith('audio/')) return 'audio';
  if (fileType.startsWith('application/') || fileType.startsWith('text/')) return 'document';
  return 'other';
}