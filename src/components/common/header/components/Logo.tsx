"use client";
import { useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";

export const Logo = () => {
  const locale = useLocale();
  return (
    <div className="absolute left-1/2 -translate-x-1/2">
      <Link href={`/${locale}`} className="text-xl font-bold transition-colors hover:text-primary">
        <Image
          src={"/images/logo-light.svg"}
          alt="example.ai"
          width={120}
          height={40}
          priority
          className="dark:hidden" // Hide in dark mode
        />
        <Image
          src={"/images/logo-dark.svg"}
          alt="example.ai"
          width={120}
          height={40}
          priority
          className="hidden dark:block" // Hide in light mode, show in dark mode
        />
      </Link>
    </div>
  );
};
