import { useSidebar } from "@/components/ui/sidebar";
import { useTranslations } from "next-intl";
import Image from "next/image";

export function HeaderContent() {
  const { state } = useSidebar();
  const t = useTranslations("common");
  const isCollapsed = state === "collapsed";

  if (isCollapsed) {
    return <div />;
  }

  return (
    <div className="flex h-10 items-center justify-center">
      <Image
        src="/images/logo-dark.svg"
        className="hidden dark:block"
        alt={t("logo")}
        width={120}
        height={40}
      />
      <Image
        src="/images/logo-light.svg"
        className="block dark:hidden"
        alt={t("logo")}
        width={120}
        height={40}
      />
    </div>
  );
}
