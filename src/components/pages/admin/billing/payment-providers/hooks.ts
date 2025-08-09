import {
  deleteProvider,
  getProvider,
  updateProvider,
} from "@/actions/admin/billing/providers/item";
import { createProvider, getProviders } from "@/actions/admin/billing/providers/providers";
import { AccountStatus, PaymentProvider, PaymentProviderAccount } from "@/db/generated/prisma";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";

interface CreatePaymentProviderInput {
  name: string;
  provider: PaymentProvider;
  status: AccountStatus;
  priority: number;
  code: string;
  providerSecretKey?: string;
  providerWebhookSecret?: string;
}

interface UpdatePaymentProviderInput {
  id: string;
  name?: string;
  provider?: PaymentProvider;
  status?: AccountStatus;
  priority?: number;
  code?: string;
  providerSecretKey?: string;
  providerWebhookSecret?: string;
}

const QUERY_KEY = "payment-providers";

// API calls
const fetchProviders = async (): Promise<PaymentProviderAccount[]> => {
  return getProviders();
};

const fetchProviderById = async (id: string): Promise<PaymentProviderAccount> => {
  return getProvider(id);
};

const createProviderAction = async (
  data: CreatePaymentProviderInput
): Promise<PaymentProviderAccount> => {
  return createProvider(data);
};

const updateProviderAction = async (
  data: UpdatePaymentProviderInput
): Promise<PaymentProviderAccount> => {
  return updateProvider(data.id, data);
};

const deleteProviderAction = async (id: string): Promise<void> => {
  await deleteProvider(id);
};

// Hooks
export const useProviders = () => {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: fetchProviders,
  });
};

export const useProvider = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => fetchProviderById(id),
    enabled: !!id,
  });
};

export const useCreateProvider = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("admin.billing.payment-providers");

  return useMutation({
    mutationFn: createProviderAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success(t("createSuccess"));
    },
    onError: (error) => {
      console.error("Create provider error:", error);
      toast.error(t("createError"));
    },
  });
};

export const useUpdateProvider = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("admin.billing.payment-providers");

  return useMutation({
    mutationFn: updateProviderAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success(t("updateSuccess"));
    },
    onError: (error) => {
      console.error("Update provider error:", error);
      toast.error(t("updateError"));
    },
  });
};

export const useDeleteProvider = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("admin.billing.payment-providers");

  return useMutation({
    mutationFn: deleteProviderAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success(t("deleteSuccess"));
    },
    onError: (error) => {
      console.error("Delete provider error:", error);
      toast.error(t("deleteError"));
    },
  });
};
