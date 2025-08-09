import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash } from "lucide-react";
import { useTranslations } from "next-intl";

interface DesktopDataTableProps<T> {
  columns: {
    header: string;
    accessorKey: string;
    cell?: (row: T) => React.ReactNode;
  }[];
  data: T[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  customActions?: (row: T) => React.ReactNode;
  // Multi-select functionality - optional
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export function DesktopDataTable<T extends { id: string }>({
  columns,
  data,
  onEdit,
  onDelete,
  customActions,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
}: DesktopDataTableProps<T>) {
  const t = useTranslations("components.datatable");
  const hasActions = onEdit || onDelete || customActions;

  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(checked ? data.map(item => item.id) : []);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange([...selectedIds, id]);
      } else {
        onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
      }
    }
  };

  const isAllSelected = selectedIds.length === data.length && data.length > 0;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {selectable && (
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
          )}
          {columns.map((column) => (
            <TableHead key={column.accessorKey}>{column.header}</TableHead>
          ))}
          {hasActions && <TableHead>{t("actions")}</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.id}>
            {selectable && (
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(row.id)}
                  onCheckedChange={(checked) => handleSelectItem(row.id, !!checked)}
                />
              </TableCell>
            )}
            {columns.map((column) => (
              <TableCell key={column.accessorKey}>
                {column.cell ? column.cell(row) : (row[column.accessorKey as keyof T] as string)}
              </TableCell>
            ))}
            {hasActions && (
              <TableCell>
                <div className="flex gap-2">
                  {onEdit && (
                    <Button variant="ghost" size="icon" onClick={() => onEdit(row.id)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button variant="ghost" size="icon" onClick={() => onDelete(row.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                  {customActions && customActions(row)}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
