export const isProductionEnvironment = process.env.NODE_ENV === "production";

export enum TaskType {
  ModelDirectInvocation = "model-direct-invocation",
  Template = "template",
}

export enum ModelCategory {
  TextToImage = "text-to-image",
  ImageToImage = "image-to-image",
  TextToVideo = "text-to-video",
  ImageToVideo = "image-to-video",
  TextToMusic = "text-to-music",
  Unknown = "unknown",
}

export enum TemplateType {
  StylizedAnimeImage = "stylized-anime-image",
  StylizedAnimeVideo = "stylized-anime-video",
  CombineImages = "combine-images",
}

export enum StorageObjectSource {
  USER_UPLOAD = "user-upload",
  USER_GENERATED = "user-generated",
}
