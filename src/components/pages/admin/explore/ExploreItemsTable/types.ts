import { ExploreItemStatus } from "@/db/generated/prisma";

export interface ExploreItemsTableProps {
  statusFilter: ExploreItemStatus | "ALL";
  typeFilter: string;
  visibilityFilter: string;
  featuredFilter: string;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
}