import { upsertNotification } from "@/actions/admin/notifications/upsert";
import { getUsers } from "@/actions/admin/user/users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  NotificationReadStatus,
  NotificationTargetUserType,
  NotificationType,
} from "@/db/generated/prisma";
import { Locale, locales } from "@/i18n/locales";
import { NotificationMessageDetail } from "@/types/notifications/index";
import { Cross2Icon, InfoCircledIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface NotificationModalProps {
  open: boolean;
  onClose: () => void;
  notification?: NotificationMessageDetail;
}

interface Translation {
  locale: string;
  title: string;
  content: string;
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
}

async function fetchUsers(search: string, page: number, pageSize: number) {
  try {
    const result = await getUsers({
      search,
      page,
      pageSize,
    });
    return {
      data: result.items || [],
      total: result.total || 0,
      totalPages: result.totalPages || 1,
    };
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw error;
  }
}

export default function NotificationModal({ open, onClose, notification }: NotificationModalProps) {
  const t = useTranslations("admin.notifications.modal");

  const [translations, setTranslations] = useState<Translation[]>(
    locales.map((locale) => ({
      locale,
      title: notification?.translations?.find((t) => t.locale === locale)?.title ?? "",
      content: notification?.translations?.find((t) => t.locale === locale)?.content ?? "",
    }))
  );

  const [type, setType] = useState<NotificationType>(
    notification?.type || NotificationType.PERSONALIZED
  );
  const [priority, setPriority] = useState<number>(notification?.priority || 50);
  const [scheduledAt, setScheduledAt] = useState<Date | null>(
    notification?.scheduledAt ? new Date(notification.scheduledAt) : null
  );
  const [expiresAt, setExpiresAt] = useState<Date | null>(
    notification?.expiresAt ? new Date(notification.expiresAt) : null
  );
  const [targetUserType, setTargetUserType] = useState<NotificationTargetUserType>(
    notification?.targetUserType || NotificationTargetUserType.ALL
  );

  // 用户选择相关状态 - 为个性化通知添加
  const [selectedUsers, setSelectedUsers] = useState<string[]>(
    notification?.userStatuses?.map((status) => status.userId) || []
  );
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [activeLocale, setActiveLocale] = useState<Locale>(locales[0]);
  const queryClient = useQueryClient();

  // 查询用户
  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", search, page, pageSize],
    queryFn: async () => {
      try {
        return await fetchUsers(search, page, pageSize);
      } catch (e) {
        console.error("Failed to fetch users:", e);
        throw e;
      }
    },
    enabled: open && type === "PERSONALIZED",
  });

  const users: User[] = usersData?.data || [];
  const totalPages = usersData?.totalPages || 1;

  useEffect(() => {
    setTranslations(
      locales.map((locale) => ({
        locale,
        title: notification?.translations?.find((t) => t.locale === locale)?.title ?? "",
        content: notification?.translations?.find((t) => t.locale === locale)?.content ?? "",
      }))
    );

    // 更新其他字段
    setType(notification?.type || NotificationType.PERSONALIZED);
    setPriority(notification?.priority || 50);
    setScheduledAt(notification?.scheduledAt ? new Date(notification.scheduledAt) : null);
    setExpiresAt(notification?.expiresAt ? new Date(notification.expiresAt) : null);
    setTargetUserType(notification?.targetUserType || NotificationTargetUserType.ALL);

    // 初始化选中的用户
    if (notification?.userStatuses?.length) {
      setSelectedUsers(notification.userStatuses.map((status) => status.userId));
    } else {
      setSelectedUsers([]);
    }
  }, [notification]);

  const saveNotification = async () => {
    try {
      // 在执行保存前进行验证
      if (type === NotificationType.PERSONALIZED && selectedUsers.length === 0) {
        toast.error(t("errors.personalizedNoUser"));
        return;
      }

      // 检查是否有至少一种语言的标题和内容
      const hasValidTranslation = locales.some((locale) => {
        const translation = getTranslation(locale);
        return translation.title.trim() !== "" && translation.content.trim() !== "";
      });

      if (!hasValidTranslation) {
        toast.error(t("errors.needTitleContent"));
        return;
      }

      // 构建请求体
      const data = {
        type,
        priority,
        scheduledAt: scheduledAt || null,
        expiresAt: expiresAt || null,
        targetUserType,
        translations: {
          create: locales.map((locale) => ({
            locale,
            title: getTranslation(locale).title,
            content: getTranslation(locale).content,
          })),
        },
        ...(type === NotificationType.PERSONALIZED && {
          userStatuses: {
            create: selectedUsers.map((userId) => ({
              user: {
                connect: {
                  id: userId,
                },
              },
              status: NotificationReadStatus.UNREAD,
            })),
          },
        }),
      };

      await upsertNotification({
        where: { id: notification?.id },
        create: data,
        update: {
          ...data,
          translations: {
            deleteMany: {},
            create: locales.map((locale) => ({
              locale,
              title: getTranslation(locale).title,
              content: getTranslation(locale).content,
            })),
          },
          ...(type === NotificationType.PERSONALIZED && {
            userStatuses: {
              deleteMany: {},
              create: selectedUsers.map((userId) => ({
                user: {
                  connect: {
                    id: userId,
                  },
                },
                status: NotificationReadStatus.UNREAD,
              })),
            },
          }),
        },
      });

      // 操作成功
      toast.success(notification ? t("success.updated") : t("success.created"));

      // 刷新通知列表数据
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      // 关闭模态框
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(t("errors.unknownError"));
    }
  };

  const handleTranslationChange = (locale: string, field: "title" | "content", value: string) => {
    setTranslations((prev) =>
      prev.map((t) => (t.locale === locale ? { ...t, [field]: value } : t))
    );
  };

  const getTranslation = (locale: string) => {
    return (
      translations.find((t) => t.locale === locale) || {
        locale,
        title: "",
        content: "",
      }
    );
  };

  // 用户选择相关方法
  const handleUserSelect = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, userId]);
    } else {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setSearch(searchInput);
      setPage(1);
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelectedUsers = [...selectedUsers];
      users.forEach((user) => {
        if (!selectedUsers.includes(user.id)) {
          newSelectedUsers.push(user.id);
        }
      });
      setSelectedUsers(newSelectedUsers);
    } else {
      // 仅取消当前页面的选择
      const currentPageIds = users.map((user) => user.id);
      setSelectedUsers((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    }
  };

  const removeSelectedUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((id) => id !== userId));
  };

  // 计算当前页面上所有用户是否被选中
  const isAllSelected = users.length > 0 && users.every((user) => selectedUsers.includes(user.id));

  // 是否为系统通知
  const isSystemNotification = type === "SYSTEM";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {notification ? t("editTitle") : t("createTitle")}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh] pr-4">
          <div className="space-y-6 p-2">
            {/* Notification type and basic settings combined */}
            <Card className="border-border bg-card overflow-hidden">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <h3 className="text-base font-semibold">{t("basicSettings")}</h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-medium">{t("notificationType")}</Label>
                        <Select
                          value={type}
                          onValueChange={(value: NotificationType) => {
                            setType(value);
                            if (value === NotificationType.SYSTEM) {
                              setTargetUserType(NotificationTargetUserType.ALL);
                            }
                          }}
                        >
                          <SelectTrigger className="border-input focus:ring-ring">
                            <SelectValue placeholder={t("notificationType")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NotificationType.PERSONALIZED}>
                              {t("notificationTypes.personalized")}
                            </SelectItem>
                            <SelectItem value={NotificationType.SYSTEM}>
                              {t("notificationTypes.system")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {isSystemNotification && (
                        <div className="space-y-2">
                          <Label htmlFor="priority" className="font-medium">
                            {t("priority")}
                          </Label>
                          <Input
                            id="priority"
                            type="number"
                            min="0"
                            max="100"
                            value={priority}
                            onChange={(e) => setPriority(Number(e.target.value))}
                            className="border-input focus:ring-ring w-24"
                          />
                          <p className="text-muted-foreground text-xs">{t("priorityHelp")}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="scheduledAt" className="font-medium">
                          {t("scheduledTime")}
                        </Label>
                        <Input
                          id="scheduledAt"
                          type="datetime-local"
                          value={scheduledAt ? scheduledAt.toISOString().slice(0, 16) : ""}
                          onChange={(e) =>
                            setScheduledAt(e.target.value ? new Date(e.target.value) : null)
                          }
                          className="border-input focus:ring-ring"
                        />
                        <p className="text-muted-foreground text-xs">{t("scheduledTimeHelp")}</p>
                      </div>

                      {isSystemNotification && (
                        <div className="space-y-2">
                          <Label htmlFor="expiresAt" className="font-medium">
                            {t("expiryTime")}
                          </Label>
                          <Input
                            id="expiresAt"
                            type="datetime-local"
                            value={expiresAt ? expiresAt.toISOString().slice(0, 16) : ""}
                            onChange={(e) =>
                              setExpiresAt(e.target.value ? new Date(e.target.value) : null)
                            }
                            className="border-input focus:ring-ring"
                          />
                          <p className="text-muted-foreground text-xs">{t("expiryTimeHelp")}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {isSystemNotification && (
                    <div className="mt-2">
                      <div className="max-w-xs space-y-2">
                        <Label className="font-medium">{t("targetUsers")}</Label>
                        <Select
                          value={targetUserType}
                          onValueChange={(value) =>
                            setTargetUserType(value as NotificationTargetUserType)
                          }
                        >
                          <SelectTrigger className="border-input focus:ring-ring">
                            <SelectValue placeholder={t("targetUsers")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NotificationTargetUserType.ALL}>
                              {t("userGroup.all")}
                            </SelectItem>
                            <SelectItem value={NotificationTargetUserType.NEW_USERS}>
                              {t("userGroup.new")}
                            </SelectItem>
                            <SelectItem value={NotificationTargetUserType.EXISTING_USERS}>
                              {t("userGroup.existing")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-muted-foreground text-xs">
                          {targetUserType === "ALL"
                            ? t("targetUsersHelp.all")
                            : targetUserType === "NEW_USERS"
                              ? t("targetUsersHelp.new")
                              : t("targetUsersHelp.existing")}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    {isSystemNotification ? (
                      <div className="bg-muted flex items-start space-x-2 rounded-md p-3 text-sm">
                        <InfoCircledIcon className="text-muted-foreground mt-0.5 h-5 w-5 flex-shrink-0" />
                        <span className="text-muted-foreground">{t("systemNoticeHelp")}</span>
                      </div>
                    ) : (
                      <div className="bg-muted flex items-start space-x-2 rounded-md p-3 text-sm">
                        <InfoCircledIcon className="text-muted-foreground mt-0.5 h-5 w-5 flex-shrink-0" />
                        <span className="text-muted-foreground">{t("personalizedNoticeHelp")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personalized notification - User selection */}
            {!isSystemNotification && (
              <Card className="border-border bg-card overflow-hidden">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold">{t("selectRecipients")}</h3>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <MagnifyingGlassIcon className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                        <Input
                          placeholder={t("searchUserPlaceholder")}
                          value={searchInput}
                          onChange={handleSearchChange}
                          onKeyDown={handleSearchKeyDown}
                          className="border-input focus:ring-ring pl-9"
                        />
                      </div>
                      <Button
                        onClick={handleSearch}
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
                            onClick={() => setSelectedUsers([])}
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
                                    onClick={() => removeSelectedUser(userId)}
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
                            onCheckedChange={handleSelectAll}
                            disabled={users.length === 0}
                          />
                          <Label htmlFor="select-all" className="cursor-pointer font-medium">
                            {t("selectAll")}
                          </Label>
                        </div>
                        {!isLoading && users.length > 0 && (
                          <div className="text-muted-foreground text-sm">
                            {t("usersFound", { total: usersData?.total || 0 })}
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
                          <div className="text-xs">{(error as Error).message}</div>
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
                                setSearch("");
                                setSearchInput("");
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
                                  onCheckedChange={(checked) =>
                                    handleUserSelect(user.id, checked as boolean)
                                  }
                                />
                                <Label
                                  htmlFor={`select-user-${user.id}`}
                                  className="flex-1 cursor-pointer"
                                >
                                  <div className="flex flex-col">
                                    <div className="flex items-center">
                                      {user.name && (
                                        <span className="font-medium">{user.name}</span>
                                      )}
                                    </div>
                                    {user.email && (
                                      <span className="text-muted-foreground text-xs">
                                        {user.email}
                                      </span>
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
                              onClick={() => setPage(page - 1)}
                              className="h-7 w-7 p-0"
                            >
                              &lt;
                            </Button>
                          )}

                          {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                            // 显示当前页码附近的页码
                            const pageNum =
                              page <= 3
                                ? i + 1
                                : page >= totalPages - 2
                                  ? totalPages - 4 + i
                                  : page - 2 + i;

                            if (pageNum > 0 && pageNum <= totalPages) {
                              return (
                                <Button
                                  key={i}
                                  variant={page === pageNum ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setPage(pageNum)}
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
                              onClick={() => setPage(page + 1)}
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
            )}

            {/* Notification content - Changed to left-right layout */}
            <Card className="border-border bg-card overflow-hidden">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <h3 className="text-base font-semibold">{t("notificationContent")}</h3>

                  <div className="flex flex-col gap-4 md:flex-row">
                    {/* Left side - Language selection */}
                    <div className="w-full md:w-1/4">
                      <Label className="mb-2 block font-medium">{t("selectLanguage")}</Label>
                      <div className="border-border bg-card rounded-md border">
                        <div className="flex flex-col divide-y">
                          {locales.map((locale) => (
                            <button
                              key={locale}
                              className={`hover:bg-muted/50 p-3 text-left capitalize ${
                                activeLocale === locale ? "bg-muted font-medium" : ""
                              }`}
                              onClick={() => setActiveLocale(locale as Locale)}
                            >
                              {locale}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right side - Title and content */}
                    <div className="w-full space-y-4 md:w-3/4">
                      <div className="space-y-2">
                        <Label className="font-medium">{t("title")}</Label>
                        <Input
                          value={getTranslation(activeLocale).title}
                          onChange={(e) =>
                            handleTranslationChange(activeLocale, "title", e.target.value)
                          }
                          placeholder={t("titlePlaceholder", { locale: activeLocale })}
                          className="border-input focus:ring-ring"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">{t("content")}</Label>
                        <Textarea
                          value={getTranslation(activeLocale).content}
                          onChange={(e) =>
                            handleTranslationChange(activeLocale, "content", e.target.value)
                          }
                          placeholder={t("contentPlaceholder", { locale: activeLocale })}
                          rows={8}
                          className="border-input focus:ring-ring min-h-[180px] resize-y"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <Separator className="my-2" />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="border-input hover:bg-muted">
            {t("cancel")}
          </Button>
          <Button
            onClick={saveNotification}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {t("saveNotification")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
