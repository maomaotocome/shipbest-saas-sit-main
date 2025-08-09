import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash } from "lucide-react";

interface MobileDataTableProps<T> {
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

export function MobileDataTable<T extends { id: string }>({
  columns,
  data,
  onEdit,
  onDelete,
  customActions,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
}: MobileDataTableProps<T>) {
  const hasActions = onEdit || onDelete || customActions;

  const handleSelectItem = (id: string, checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange([...selectedIds, id]);
      } else {
        onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
      }
    }
  };

  return (
    <div className="space-y-4">
      {data.map((row) => (
        <Card key={row.id}>
          <CardContent className="pt-6">
            {selectable && (
              <div className="mb-4 flex items-center space-x-2">
                <Checkbox
                  checked={selectedIds.includes(row.id)}
                  onCheckedChange={(checked) => handleSelectItem(row.id, !!checked)}
                />
                <span className="text-sm font-medium">Select</span>
              </div>
            )}
            {columns.map((column) => (
              <div key={column.accessorKey} className="mb-2">
                <div className="text-muted-foreground text-sm font-medium">{column.header}</div>
                <div>
                  {column.cell ? column.cell(row) : (row[column.accessorKey as keyof T] as string)}
                </div>
              </div>
            ))}
          </CardContent>{" "}
          {hasActions && (
            <CardFooter className="flex justify-end gap-2 border-t pt-4">
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
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}
