"use client";

import { DataTable } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import { AccountStatus, PaymentProvider, PaymentProviderAccount } from "@/db/generated/prisma";
import { Webhook } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import PaymentProviderFormModal from "./PaymentProviderFormModal";
import WebhookFormModal from "./WebhookFormModal";
import { useDeleteProvider, useProviders } from "./hooks";

const PROVIDER_DISPLAY_NAMES: Record<PaymentProvider, string> = {
  STRIPE: "Stripe",
  LEMON_SQUEEZY: "Lemon Squeezy",
  PADDLE: "Paddle",
};

const getStatusColor = (status: AccountStatus): string => {
  switch (status) {
    case AccountStatus.ACTIVE:
      return "bg-green-100 text-green-800";
    case AccountStatus.SUSPENDED:
      return "bg-yellow-100 text-yellow-800";
    case AccountStatus.BLOCKED:
      return "bg-red-100 text-red-800";
    case AccountStatus.QUOTA_EXCEEDED:
      return "bg-orange-100 text-orange-800";
    case AccountStatus.MAINTENANCE:
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function PaymentProvidersPage() {
  const t = useTranslations("admin.billing.payment-providers");
  const { data: providers = [], isLoading } = useProviders();
  const deleteProviderMutation = useDeleteProvider();

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [webhookModalOpen, setWebhookModalOpen] = useState(false);
  const [editingProviderId, setEditingProviderId] = useState<string>();
  const [deletingProvider, setDeletingProvider] = useState<PaymentProviderAccount>();
  const [selectedProvider, setSelectedProvider] = useState<PaymentProviderAccount>();
  const columns = [
    {
      header: t("columns.name"),
      accessorKey: "name",
    },
    {
      header: t("columns.code"),
      accessorKey: "code",
    },
    {
      header: t("columns.provider"),
      accessorKey: "provider",
      cell: (row: PaymentProviderAccount) => PROVIDER_DISPLAY_NAMES[row.provider],
    },
    {
      header: t("columns.status"),
      accessorKey: "status",
      cell: (row: PaymentProviderAccount) => (
        <span className={`rounded-full px-2 py-1 text-sm ${getStatusColor(row.status)}`}>
          {t(`status.${row.status}`)}
        </span>
      ),
    },
    {
      header: t("columns.priority"),
      accessorKey: "priority",
    },
  ];

  const handleAdd = () => {
    setEditingProviderId(undefined);
    setFormModalOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditingProviderId(id);
    setFormModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const provider = providers.find((p) => p.id === id);
    setDeletingProvider(provider);
    setDeleteModalOpen(true);
  };

  const handleFormSubmit = () => {
    setFormModalOpen(false);
    setEditingProviderId(undefined);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProvider) return;

    try {
      await deleteProviderMutation.mutateAsync(deletingProvider.id);
      setDeleteModalOpen(false);
      setDeletingProvider(undefined);
    } catch (error) {
      console.error("Error deleting provider:", error);
    }
  };

  const handleWebhookRegister = (provider: PaymentProviderAccount) => {
    setSelectedProvider(provider);
    setWebhookModalOpen(true);
  };

  return (
    <div className="mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <button
          className="bg-primary hover:bg-primary/90 dark:hover:bg-primary-dark/90 rounded-md px-4 py-2 text-white/90 dark:text-black/90"
          onClick={handleAdd}
        >
          {t("addProvider")}
        </button>
      </div>

      <DataTable
        columns={columns}
        data={providers}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        customActions={(row) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleWebhookRegister(row)}
            title={t("registerWebhook")}
          >
            <Webhook className="h-4 w-4" />
          </Button>
        )}
      />

      <PaymentProviderFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        providerId={editingProviderId}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmationDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteProviderMutation.isPending}
        itemName={deletingProvider?.name}
      />

      {selectedProvider && (
        <WebhookFormModal
          isOpen={webhookModalOpen}
          onClose={() => {
            setWebhookModalOpen(false);
            setSelectedProvider(undefined);
          }}
          provider={selectedProvider}
        />
      )}
    </div>
  );
}
