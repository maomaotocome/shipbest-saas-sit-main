import { useMediaQuery } from "@/hooks";
import { useTranslations } from "next-intl";
import { DesktopDataTable } from "./desktop-data-table";
import { MobileDataTable } from "./mobile-data-table";

interface DataTableProps<T> {
  columns: {
    header: string;
    accessorKey: string;
    cell?: (row: T) => React.ReactNode;
  }[];
  data: T[];
  loading?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  customActions?: (row: T) => React.ReactNode;
  // Multi-select functionality - optional
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export function DataTable<T extends { id: string }>(props: DataTableProps<T>) {
  const { loading, data, columns, onEdit, onDelete, customActions, selectable, selectedIds, onSelectionChange } = props;
  const t = useTranslations("components.datatable");
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (loading) {
    return <div className="flex h-full items-center justify-center">{t("loading")}</div>;
  }

  if (isMobile) {
    return (
      <MobileDataTable
        columns={columns}
        data={data}
        onEdit={onEdit}
        onDelete={onDelete}
        customActions={customActions}
        selectable={selectable}
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
      />
    );
  }

  return (
    <DesktopDataTable
      columns={columns}
      data={data}
      onEdit={onEdit}
      onDelete={onDelete}
      customActions={customActions}
      selectable={selectable}
      selectedIds={selectedIds}
      onSelectionChange={onSelectionChange}
    />
  );
}
