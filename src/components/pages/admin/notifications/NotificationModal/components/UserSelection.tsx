import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import { User } from "../types";

interface UserSelectionProps {
  selectedUsers: string[];
  onUserSelect: (userId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onRemoveUser: (userId: string) => void;
  onClearSelection: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  page: number;
  onPageChange: (page: number) => void;
  users: User[];
  isLoading: boolean;
  error: Error | null;
  totalPages: number;
}

export function UserSelection({
  selectedUsers,
  onUserSelect,
  onSelectAll,
  onRemoveUser,
  onClearSelection,
  search,
  onSearchChange,
  onSearch,
  page,
  onPageChange,
  users,
  isLoading,
  error,
  totalPages,
}: UserSelectionProps) {
  const t = useTranslations("admin.notifications.modal");
  const isAllSelected = users.length > 0 && users.every((user) => selectedUsers.includes(user.id));

  return (
    <Card className="border-border bg-card overflow-hidden">
      <CardContent className="p-4">
        <div className="space-y-4">
          <h3 className="text-base font-semibold">{t("selectRecipients")}</h3>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                placeholder={t("searchUserPlaceholder")}
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onSearch();
                  }
                }}
                className="border-input focus:ring-ring pl-9"
              />
            </div>
            <Button
              onClick={onSearch}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t("search")}
            </Button>
          </div>

          {selectedUsers.length > 0 && (
            <div className="border-border bg-muted/30 rounded-md border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">
                  {t("selectedUsers", { count: selectedUsers.length })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearSelection}
                  className="border-input hover:bg-muted h-7 text-xs"
                >
                  {t("clearSelection")}
                </Button>
              </div>
              <ScrollArea className="max-h-20">
                <div className="flex flex-wrap gap-1.5 p-0.5">
                  {selectedUsers.map((userId) => {
                    const user = users.find((u) => u.id === userId) || {
                      id: userId,
                      name: t("unknownUser"),
                      email: null,
                    };
                    return (
                      <Badge
                        key={userId}
                        variant="secondary"
                        className="bg-accent text-accent-foreground mb-0.5 py-1 pr-1 pl-2"
                      >
                        <span className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                          {user.name || user.email || t("unknownUser")}
                        </span>
                        <button
                          className="hover:bg-muted ml-1 rounded-full p-0.5"
                          onClick={() => onRemoveUser(userId)}
                          aria-label={t("removeUser", {
                            name: user.name || user.email || t("unknownUser"),
                          })}
                        >
                          <Cross2Icon className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}

          <div className="border-border overflow-hidden rounded-md border">
            <div className="bg-muted/30 flex items-center justify-between border-b p-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={isAllSelected && users.length > 0}
                  onCheckedChange={onSelectAll}
                  disabled={users.length === 0}
                />
                <Label htmlFor="select-all" className="cursor-pointer font-medium">
                  {t("selectAll")}
                </Label>
              </div>
              {!isLoading && users.length > 0 && (
                <div className="text-muted-foreground text-sm">
                  {t("usersFound", { total: users.length })}
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Spinner className="text-primary h-8 w-8" />
              </div>
            ) : error ? (
              <div className="text-destructive p-6 text-center text-sm">
                <div className="mb-2">{t("loadingError")}</div>
                <div className="text-xs">{error.message}</div>
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-muted-foreground mb-2">
                  {search ? t("noMatchingUsers") : t("pleaseSearchUsers")}
                </div>
                {search && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onSearchChange("");
                      onSearch();
                    }}
                    className="mt-2"
                  >
                    {t("clearSearch")}
                  </Button>
                )}
              </div>
            ) : (
              <ScrollArea className="h-48">
                <div className="divide-y">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="hover:bg-muted/50 flex items-center space-x-3 p-3"
                    >
                      <Checkbox
                        id={`select-user-${user.id}`}
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => onUserSelect(user.id, checked as boolean)}
                      />
                      <Label htmlFor={`select-user-${user.id}`} className="flex-1 cursor-pointer">
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            {user.name && <span className="font-medium">{user.name}</span>}
                          </div>
                          {user.email && (
                            <span className="text-muted-foreground text-xs">{user.email}</span>
                          )}
                          {!user.name && !user.email && <span>{t("unknownUser")}</span>}
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {totalPages > 1 && (
              <div className="bg-muted/30 flex justify-center gap-1 border-t p-2">
                {page > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(page - 1)}
                    className="h-7 w-7 p-0"
                  >
                    &lt;
                  </Button>
                )}

                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  const pageNum =
                    page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;

                  if (pageNum > 0 && pageNum <= totalPages) {
                    return (
                      <Button
                        key={i}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange(pageNum)}
                        className="h-7 w-7 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                  return null;
                })}

                {page < totalPages && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(page + 1)}
                    className="h-7 w-7 p-0"
                  >
                    &gt;
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
