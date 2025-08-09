import { Prisma } from "@/db/generated/prisma";

export const TaskWithoutSystemRequestSelect = {
  subTasks: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  taskType: true,
  userId: true,
  id: true,
  request: true,
  actualCredits: true,
  credits: true,
  systemRequest: false,
  response: true,
  isPublic: true,
  user: {
    select: {
      id: true,
    },
  },
};

export type TaskListItem = Prisma.TaskGetPayload<{
  select: typeof TaskWithoutSystemRequestSelect;
}>;

export type TaskTypeInfo = Record<
  string,
  {
    title: string;
    description: string;
  }
>;

export interface ImageInfo {
  source_url: string;
  source_content_type: string;
  source_file_name: string;
  source_file_size?: number;
  source_width?: number;
  source_height?: number;
  original_object_id?: string;
  original_object_signed_url?: string;
  compressed_object_id?: string;
  compressed_object_signed_url?: string;
}

export interface ImageSubTaskResponse {
  request_id: string;
  images: ImageInfo[];
  error?: string;
}

export interface VideoInfo {
  source_url: string;
  source_content_type: string;
  source_file_name: string;
  source_file_size?: number;
  source_width?: number;
  source_height?: number;
  duration?: number;
  original_object_id?: string;
  original_object_signed_url?: string;
  compressed_object_id?: string;
  compressed_object_signed_url?: string;
}

export interface VideoSubTaskResponse {
  request_id: string;
  videos: VideoInfo[];
  error?: string;
}

export interface AudioInfo {
  source_url: string;
  source_content_type: string;
  source_file_name: string;
  source_file_size?: number;
  duration?: number;
  stream_audio_url?: string;
  image_url?: string;
  title?: string;
  tags?: string;
  original_object_id?: string;
  original_image_object_id?: string;
  compressed_image_object_id?: string;
}

export interface AudioSubTaskResponse {
  request_id: string;
  audios: AudioInfo[];
  error?: string;
}
