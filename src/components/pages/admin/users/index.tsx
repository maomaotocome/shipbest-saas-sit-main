"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/use-debounce";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import UserTable from "./UserTable";

const PAGE_SIZE = 15;

export default function UsersPage() {
  const [mounted, setMounted] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [page, setPage] = useState(1);
  const debouncedName = useDebounce(searchName, 300);
  const debouncedEmail = useDebounce(searchEmail, 300);
  const t = useTranslations("admin.users");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = () => {
    setSearchName(nameInput);
    setSearchEmail(emailInput);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
      </div>

      <div className="border-border bg-card mb-6 rounded-lg border p-4">
        <div className="flex flex-col items-end gap-6 sm:flex-row">
          <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name-search">{t("form.name")}:</Label>
              <Input
                id="name-search"
                placeholder={t("searchNamePlaceholder")}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-search">{t("form.email")}:</Label>
              <Input
                id="email-search"
                placeholder={t("searchEmailPlaceholder")}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full"
              />
            </div>
          </div>
          <Button onClick={handleSearch} className="w-full sm:w-auto">
            <MagnifyingGlassIcon className="mr-2 h-4 w-4" />
            {t("search")}
          </Button>
        </div>
      </div>

      <UserTable
        searchName={debouncedName}
        searchEmail={debouncedEmail}
        page={page}
        setPage={setPage}
        pageSize={PAGE_SIZE}
      />
    </>
  );
}
