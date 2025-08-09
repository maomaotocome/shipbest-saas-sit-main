export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

// Helper type for Prisma model delegates used in pagination
// TCountArgs: Prisma count arguments type (e.g., Prisma.UserCountArgs)
// TFindArgs: Prisma findMany arguments type (e.g., Prisma.UserFindManyArgs)
// TItem: The type of the items returned by findMany (e.g., User)
export type ModelDelegate<TCountArgs, TFindArgs, TItem> = {
  count: (args?: TCountArgs) => Promise<number>;
  findMany: (args?: TFindArgs & { skip?: number; take?: number }) => Promise<TItem[]>;
};
