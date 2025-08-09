"use client";

import { DataTable } from "@/components/common/data-table";
import Pagination from "@/components/common/pagination";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/use-debounce";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl"; // Import useTranslations
import React, { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { useColumns } from "./columns"; // Removed InvoiceWithUser import as it's not directly used here
import { useInvoices } from "./hooks"; // Import the real hook

// Helper function to format date for API
const formatDateForAPI = (date: Date): string => {
  return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD format
};

export default function InvoiceManagementPage() {
  const t = useTranslations("admin.billing.invoice"); // Get translations
  const [mounted, setMounted] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const [searchEmail, setSearchEmail] = useState("");
  const [searchStartDate, setSearchStartDate] = useState<string | undefined>(undefined);
  const [searchEndDate, setSearchEndDate] = useState<string | undefined>(undefined);

  const [page, setPage] = useState(1);
  const pageSize = 10; // Or get from config/settings

  // Debounce search inputs
  const debouncedEmail = useDebounce(searchEmail, 500);
  const debouncedStartDate = useDebounce(searchStartDate, 500);
  const debouncedEndDate = useDebounce(searchEndDate, 500);
  const columns = useColumns();
  // TODO: Add actual data fetching
  const { data, isLoading } = useInvoices({
    email: debouncedEmail,
    startDate: debouncedStartDate,
    endDate: debouncedEndDate,
    page,
    pageSize,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = () => {
    setSearchEmail(emailInput);
    setSearchStartDate(dateRange?.from ? formatDateForAPI(dateRange.from) : undefined);
    setSearchEndDate(dateRange?.to ? formatDateForAPI(dateRange.to) : undefined);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Prevent rendering on server to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("page.title")}</h1>
        {/* Add Create/Export buttons here if needed */}
      </div>

      {/* Search and Filter Section */}
      <div className="border-border bg-card mb-6 rounded-lg border p-4">
        <div className="flex flex-wrap items-end gap-4">
          {/* Email Search */}
          <div className="flex-grow space-y-2 sm:w-auto sm:flex-grow-0">
            <Label htmlFor="email-search">{t("page.filters.emailLabel")}</Label>
            <Input
              id="email-search"
              placeholder={t("page.filters.emailPlaceholder")}
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full sm:w-64"
            />
          </div>

          {/* Date Range Picker */}
          <div className="space-y-2">
            <Label htmlFor="date-range">{t("page.filters.dateRangeLabel")}</Label>
            <DatePickerWithRange
              value={dateRange}
              onChange={setDateRange}
              className="w-full sm:w-auto"
            />
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <Button onClick={handleSearch} className="w-full sm:w-auto">
              <MagnifyingGlassIcon className="mr-2 h-4 w-4" />
              {t("page.filters.searchButton")}
            </Button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="border-border bg-card rounded-lg border">
        <DataTable columns={columns} data={data?.items || []} loading={isLoading} />
      </div>

      {/* Pagination */}
      <Pagination totalPages={data?.totalPages || 1} currentPage={page} onPageChange={setPage} />
    </div>
  );
}
