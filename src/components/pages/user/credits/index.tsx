"use client";

import { getGrants } from "@/actions/user/credits/grants";
import { getCreditSummary } from "@/actions/user/credits/summary";
import { getTransactions } from "@/actions/user/credits/transactions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaginatedResponse } from "@/types/pagination";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { CreditGrantWithDetails, CreditsGrants } from "./credits-grants";
import { CreditsHeader } from "./credits-header";
import { CreditsTransactions, CreditTransactionWithDetails } from "./credits-transactions";

interface CreditSummary {
  availableAmount: number;
  pendingAmount: number;
}

export default function CreditsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const t = useTranslations("user.credits");
  const [grantsPage, setGrantsPage] = useState(1);
  const grantsPageSize = 10;
  const [transactionsPage, setTransactionsPage] = useState(1);
  const transactionsPageSize = 10;

  const { data: summary } = useQuery<CreditSummary>({
    queryKey: ["credits-summary"],
    queryFn: getCreditSummary,
  });

  const { data: grantsData, isLoading: isGrantsLoading } = useQuery<
    PaginatedResponse<CreditGrantWithDetails>
  >({
    queryKey: ["credit-grants", grantsPage, grantsPageSize],
    queryFn: () => getGrants({ page: grantsPage, pageSize: grantsPageSize }),
  });

  const { data: transactionsData, isLoading: isTransactionsLoading } = useQuery<
    PaginatedResponse<CreditTransactionWithDetails>
  >({
    queryKey: [
      "credit-transactions",
      dateRange?.from?.toISOString(),
      dateRange?.to?.toISOString(),
      transactionsPage,
      transactionsPageSize,
    ],
    queryFn: async () => {
      const fromISO = dateRange?.from?.toISOString();
      const toISO = dateRange?.to?.toISOString();

      return getTransactions({
        from: fromISO,
        to: toISO,
        page: transactionsPage,
        pageSize: transactionsPageSize,
      });
    },
  });

  const grants = grantsData?.items;
  const grantsTotalPages = grantsData?.totalPages ?? 0;

  const transactions = transactionsData?.items;
  const transactionsTotalPages = transactionsData?.totalPages ?? 0;

  return (
    <div className="container mx-auto py-6">
      <CreditsHeader summary={summary} />

      <Tabs defaultValue="grants" className="mt-6">
        <TabsList>
          <TabsTrigger value="grants">{t("creditGrants")}</TabsTrigger>
          <TabsTrigger value="transactions">{t("transactions")}</TabsTrigger>
        </TabsList>

        <TabsContent value="grants">
          <CreditsGrants
            grants={grants}
            loading={isGrantsLoading}
            totalPages={grantsTotalPages}
            currentPage={grantsPage}
            onPageChange={setGrantsPage}
          />
        </TabsContent>

        <TabsContent value="transactions">
          <CreditsTransactions
            transactions={transactions}
            loading={isTransactionsLoading}
            totalPages={transactionsTotalPages}
            currentPage={transactionsPage}
            onPageChange={setTransactionsPage}
            dateRange={dateRange ?? { from: undefined, to: undefined }}
            onDateRangeChange={(range) => {
              setTransactionsPage(1);
              setDateRange(range);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
