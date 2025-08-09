import { CategoryWithTranslations, PostWithRelations, TagWithTranslations } from "@/types/blog";

export interface PostModalProps {
  open: boolean;
  onClose: () => void;
  postId?: string | null;
}

export type { CategoryWithTranslations, PostWithRelations, TagWithTranslations };
