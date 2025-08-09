import { Badge } from "@/components/ui/badge";
import { OssBucketGetPayload } from "@/db/oss/buecets";
import { useTranslations } from "next-intl";

export const useColumns = () => {
  const t = useTranslations("admin.oss.buckets");

  return [
    {
      header: t("columns.name"),
      accessorKey: "name",
    },
    {
      header: t("columns.provider"),
      accessorKey: "provider",
      cell: (row: OssBucketGetPayload) => <Badge variant="outline">{row.provider}</Badge>,
    },
    {
      header: t("columns.bucket"),
      accessorKey: "bucket",
    },
    {
      header: t("columns.region"),
      accessorKey: "region",
      cell: (row: OssBucketGetPayload) => row.region || "-",
    },
    {
      header: t("columns.access"),
      accessorKey: "isPublic",
      cell: (row: OssBucketGetPayload) => (
        <Badge variant={row.isPublic ? "secondary" : "default"}>
          {row.isPublic ? t("status.public") : t("status.private")}
        </Badge>
      ),
    },
    {
      header: t("columns.status"),
      accessorKey: "status",
      cell: (row: OssBucketGetPayload) => (
        <Badge variant={row.status === "ACTIVE" ? "secondary" : "destructive"}>
          {row.status === "ACTIVE" ? t("status.active") : row.status}
        </Badge>
      ),
    },
    {
      header: t("columns.objects"),
      accessorKey: "contents",
      cell: (row: OssBucketGetPayload) => row._count.objects,
    },
  ];
};
