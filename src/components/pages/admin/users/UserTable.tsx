"use client";
import { DataTable } from "@/components/common/data-table";
import Pagination from "@/components/common/pagination";
import { useColumns } from "./columns";
import { useUsers } from "./use-users";

interface UserTableProps {
  searchName: string;
  searchEmail: string;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
}

export default function UserTable({
  searchName,
  searchEmail,
  page,
  setPage,
  pageSize,
}: UserTableProps) {
  const columns = useColumns();

  const { data: userData, isLoading } = useUsers({
    searchName,
    searchEmail,
    page,
    pageSize,
  });

  const users = userData?.items || [];
  const totalPages = userData?.totalPages ?? 0;

  return (
    <>
      <DataTable columns={columns} data={users} loading={isLoading} />

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
        </div>
      )}
    </>
  );
}
