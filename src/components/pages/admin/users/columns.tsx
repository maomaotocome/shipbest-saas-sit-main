import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { UserListItem } from "@/db/auth/user";
import { Role } from "@/db/generated/prisma";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import toast from "react-hot-toast";
import { useUpdateUserRole } from "./use-users";

// Role change cell component
function RoleCell({ row }: { row: UserListItem }) {
  const { data: session } = useSession();
  const updateRole = useUpdateUserRole();
  const t = useTranslations("admin.users");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleRoleChange = () => {
    // Prevent modifying own role
    if (session?.user?.email === row.email) {
      toast.error(t("role_change.error_self"));
      return;
    }
    setShowConfirmDialog(true);
  };

  const confirmRoleChange = () => {
    const newRole = row.role === Role.ADMIN ? Role.USER : Role.ADMIN;
    updateRole.mutate(
      { id: row.id, role: newRole },
      {
        onError: (error) => {
          toast.error(error.message || "Failed to update role");
        },
        onSuccess: () => {
          toast.success(t("role_change.success", { role: t(`roles.${newRole}`) }));
        },
      }
    );
    setShowConfirmDialog(false);
  };

  const dialogKey = row.role === Role.ADMIN ? "confirm_to_user" : "confirm_to_admin";

  return (
    <>
      <Button
        variant="ghost"
        onClick={handleRoleChange}
        disabled={updateRole.isPending || session?.user?.email === row.email}
        className={`font-medium ${row.role === Role.ADMIN ? "text-blue-600" : ""}`}
      >
        {t(`roles.${row.role}`)}
      </Button>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t(`role_change.${dialogKey}.title`)}</AlertDialogTitle>
            <AlertDialogDescription>{t(`role_change.${dialogKey}.message`)}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bold">
              {t(`role_change.${dialogKey}.cancel`)}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRoleChange}
              className="bg-gray-500 hover:bg-gray-600"
            >
              {t(`role_change.${dialogKey}.confirm`)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export const useColumns = () => {
  const t = useTranslations("admin.users");
  return [
    {
      header: t("columns.name"),
      accessorKey: "name",
      cell: (row: UserListItem) => row.name || t("columns.not_available"),
    },
    {
      header: t("columns.email"),
      accessorKey: "email",
      cell: (row: UserListItem) => row.email ?? t("columns.not_available"),
    },
    {
      header: t("columns.role"),
      accessorKey: "role",
      cell: (row: UserListItem) => <RoleCell row={row} />,
    },
    {
      header: t("columns.verified"),
      accessorKey: "emailVerified",
      cell: (row: UserListItem) => (
        <span className={row.emailVerified ? "text-green-600" : "text-red-600"}>
          {row.emailVerified ? t("verification.yes") : t("verification.no")}
        </span>
      ),
    },
  ];
};
