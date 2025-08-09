import { getPostsList } from "@/actions/admin/blog/posts/posts";
import { PostWithRelations } from "@/types/blog";
import { PaginatedResponse, PaginationParams } from "@/types/pagination";
import { useQuery } from "@tanstack/react-query";

interface PostsParams extends PaginationParams {
  searchTitle?: string;
  searchAuthor?: string;
}

export function usePosts(params: PostsParams) {
  const { page, pageSize, searchTitle, searchAuthor } = params;
  return useQuery<PaginatedResponse<PostWithRelations>>({
    queryKey: ["blog-posts", page, pageSize, searchTitle, searchAuthor],
    queryFn: () => getPostsList({ page, pageSize, searchTitle, searchAuthor }),
    staleTime: 1000 * 60 * 5,
  });
}
