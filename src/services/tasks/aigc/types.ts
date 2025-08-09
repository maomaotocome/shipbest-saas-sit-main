import { JsonObject } from "@/types/json";

// Common interfaces for all AIGC tasks
export interface BaseAIGCRequest {
  userId: string;
  is_public?: boolean;
}

// Text-to-Image interfaces
export interface TextToImageRequest extends BaseAIGCRequest {
  request: JsonObject;
}

// Image-to-Image interfaces
export interface ImageToImageRequest extends BaseAIGCRequest {
  prompt: string;
  negative_prompt?: string;
  num_images: number;
  aspect_ratio: string;
  models: string[];
  images: { type: "oss_object"; object_id: string }[];
  seed?: number;
}

// Text-to-Video interfaces
export interface TextToVideoRequest extends BaseAIGCRequest {
  prompt: string;
  negative_prompt?: string;
  num_videos: number;
  aspect_ratio: `${number}:${number}`;
  models: string[];
  seed?: number;
}

// Image-to-Video interfaces
export interface ImageToVideoRequest extends BaseAIGCRequest {
  prompt: string;
  frames: { type: "oss_object"; object_id: string }[];
  negative_prompt?: string;
  num_videos: number;
  aspect_ratio: `${number}:${number}`;
  models: string[];
  seed?: number;
}

// Credit calculation result interfaces
export interface CreditCalculationResult {
  totalCredits: number;
  breakdown: {
    model: string;
    credits: number;
    quantity: number;
  }[];
}

export type ImageResultItem = {
  source_url: string;
  source_content_type: string;
  source_file_name: string;
  source_file_size: number;
  source_width?: number;
  source_height?: number;
  original_object_id?: string;
  compressed_object_id?: string;
};

export type ImagesResult = {
  images: ImageResultItem[];
};

export type VideoResultItem = {
  source_url: string;
  source_content_type: string;
  source_file_name: string;
  source_file_size: number;
  source_width?: number;
  source_height?: number;
  original_object_id?: string;
  compressed_object_id?: string;
  resolution?: "480p" | "720p" | "1080p" | "4K" | string;
};

export type VideoResult = {
  videos: VideoResultItem[];
};

export type AudioResultItem = {
  source_url: string;
  source_content_type: string;
  source_file_name: string;
  source_file_size: number;
  duration?: number;
  stream_audio_url?: string;
  image_url?: string;
  title?: string;
  tags?: string;
  original_object_id?: string;
  compressed_object_id?: string;
  original_image_object_id?: string;
  compressed_image_object_id?: string;
};

export type AudioResult = {
  audios: AudioResultItem[];
};
