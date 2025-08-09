"use client";

import { flag } from "@/i18n/config";
import { Link, redirect } from "@/i18n/routing";
import { Globe } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface LocaleSwitcherContentProps {
  currentLang: string;
  pathname: string;
}

export const LocaleSwitcherContent = ({ currentLang, pathname }: LocaleSwitcherContentProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 500);
    }
  };

  const getLocalizedPath = () => {
    const segments = pathname.split("/").filter(Boolean);

    if (Object.keys(flag).includes(segments[0])) {
      return "/" + segments.slice(1).join("/");
    }

    return pathname;
  };

  return (
    <div
      ref={containerRef}
      className="group relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={`flex h-9 w-9 items-center justify-center rounded-lg p-2 ${
          isOpen
            ? "bg-accent text-accent-foreground"
            : "hover:bg-accent hover:text-accent-foreground"
        }`}
        aria-label="Change locale"
      >
        <Globe className="h-5 w-5" />
      </button>

      <div
        className={`bg-popover absolute right-0 mt-2 w-48 rounded-md shadow-xl shadow-black/10 transition-opacity duration-200 dark:shadow-white/25 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="py-1" role="menu">
          {Object.entries(flag).map(([locale, { flag: flagSrc, name }]) => (
            <Link
              key={locale}
              href={getLocalizedPath()}
              locale={locale}
              className={`hover:bg-accent hover:text-accent-foreground flex items-center px-4 py-2 text-sm ${
                locale === currentLang ? "bg-accent/50" : ""
              }`}
              onClick={() => {
                redirect({ href: getLocalizedPath(), locale });
                setIsOpen(false);
              }}
              role="menuitem"
            >
              <Image src={flagSrc} alt={name} width={20} height={20} className="mr-2" />
              <span>{name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
