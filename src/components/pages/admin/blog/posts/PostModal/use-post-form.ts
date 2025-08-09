import { getAuthorsAction } from "@/actions/admin/blog/authors/authors";
import { createPostAction } from "@/actions/admin/blog/posts/create";
import { deletePostAction } from "@/actions/admin/blog/posts/delete";
import { getPost } from "@/actions/admin/blog/posts/get";
import { updatePostAction } from "@/actions/admin/blog/posts/update";
import { BlogAuthor } from "@/db/generated/prisma";
import { PostWithRelations } from "@/types/blog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { SUPPORTED_LANGUAGES } from "./constants";

export function usePostForm(postId: string | null | undefined, onClose: () => void) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const t = useTranslations("admin.blog.posts");

  const { data: post } = useQuery({
    queryKey: ["blog-post", postId],
    queryFn: async () => {
      if (!postId) return null;
      return getPost(postId);
    },
    enabled: !!postId,
  });

  // Get available blog authors
  const { data: authors } = useQuery({
    queryKey: ["blog-authors"],
    queryFn: getAuthorsAction,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<PostWithRelations>({
    defaultValues: {
      translations: SUPPORTED_LANGUAGES.map((locale) => ({
        locale,
        title: "",
        content: "",
        metadata: "",
      })),
      tags: [],
      slug: "",
      categoryId: "",
      coverImageUrl: "",
    },
  });

  useEffect(() => {
    if (post) {
      // Reset form with post data
      const formData = {
        slug: post.slug,
        categoryId: post.categoryId,
        coverImageUrl: post.coverImageUrl || "",
        tags: post.tags.map((t: { tag: { id: string } }) => ({
          tag: t.tag,
          postId: post.id,
          tagId: t.tag.id,
        })),
        translations: SUPPORTED_LANGUAGES.map((locale) => {
          const translation = post.translations.find(
            (t: { locale: string }) => t.locale === locale
          );
          return {
            locale,
            title: translation?.title || "",
            content: translation?.content || "",
            metadata: translation?.metadata || "",
          };
        }),
      };
      reset(formData);
    }
  }, [post, reset]);

  const mutation = useMutation({
    mutationFn: async (data: PostWithRelations) => {
      // Validate required fields
      const hasValidTranslation = data.translations.some(
        (trans) => trans.title.trim() !== "" && trans.content.trim() !== ""
      );

      if (!hasValidTranslation) {
        throw new Error(t("form.atLeastOneTranslation"));
      }

      if (!data.slug.trim()) {
        throw new Error(t("form.slugEmptyError"));
      }

      if (postId) {
        // Update existing article
        const updateData = {
          slug: data.slug,
          categoryId: data.categoryId || null,
          coverImageUrl: data.coverImageUrl,
          // Update translations: delete existing ones first, then create new ones
          translations: {
            deleteMany: {},
            create: data.translations
              .filter((trans) => trans.title.trim() !== "" || trans.content.trim() !== "")
              .map((trans) => ({
                locale: trans.locale,
                title: trans.title,
                content: trans.content,
                metadata: trans.metadata || "",
              })),
          },
          // Update tags: delete existing ones first, then create new ones
          tags: {
            deleteMany: {},
            create: data.tags.map((tag) => ({
              tag: {
                connect: {
                  id: tag.tagId,
                },
              },
            })),
          },
        };

        return updatePostAction({
          where: { id: postId },
          data: updateData,
        });
      } else {
        // Create new article - need to get valid author ID
        let authorId: string;

        // First try to get associated blog author from session
        if (session?.user?.id && authors && authors.length > 0) {
          // If current user has associated blog author, use it
          const userAuthor = authors.find(
            (author: BlogAuthor) => author.userId === session.user.id
          );
          if (userAuthor) {
            authorId = userAuthor.id;
          } else {
            // Otherwise use the first available author
            authorId = authors[0].id;
          }
        } else if (authors && authors.length > 0) {
          // Use the first available author
          authorId = authors[0].id;
        } else {
          throw new Error(t("messages.noAuthorsFound"));
        }

        const createData = {
          slug: data.slug,
          categoryId: data.categoryId || null,
          coverImageUrl: data.coverImageUrl,
          authorId,
          translations: {
            create: data.translations
              .filter((trans) => trans.title.trim() !== "" || trans.content.trim() !== "")
              .map((trans) => ({
                locale: trans.locale,
                title: trans.title,
                content: trans.content,
                metadata: trans.metadata || "",
              })),
          },
          tags: {
            create: data.tags.map((tag) => ({
              tag: {
                connect: {
                  id: tag.tagId,
                },
              },
            })),
          },
        };

        return createPostAction({
          data: createData,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-post", postId] });
      toast.success(postId ? t("messages.updateSuccess") : t("messages.createSuccess"));
      onClose();
    },
    onError: (error) => {
      console.error("Save post failed:", error);
      toast.error(
        error instanceof Error
          ? t("messages.saveFailed", { message: error.message })
          : t("messages.unknownError")
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!postId) return;
      return deletePostAction(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast.success(t("messages.deleteSuccess"));
      onClose();
    },
    onError: (error) => {
      console.error("Delete post failed:", error);
      toast.error(
        error instanceof Error
          ? t("messages.deleteFailed", { message: error.message })
          : t("messages.unknownDeleteError")
      );
    },
  });

  return {
    post,
    register,
    handleSubmit,
    watch,
    setValue,
    errors,
    mutation,
    deleteMutation,
  };
}
