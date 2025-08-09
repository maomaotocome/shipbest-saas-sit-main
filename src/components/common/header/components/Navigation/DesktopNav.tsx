"use client";

import type { NavItem } from "@/staticData/menu";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

const MenuButton = ({
  item,
  isOpen,
  onMouseEnter,
  onMouseLeave,
}: {
  item: NavItem;
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) => {
  const MenuComponent = item.largeMenu;

  return (
    <div className="relative" onMouseLeave={onMouseLeave}>
      <button
        onMouseEnter={onMouseEnter}
        className="hover:text-primary flex items-center gap-1 transition-colors duration-200"
      >
        {item.label}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {MenuComponent && (
        <div
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className={`${
            isOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
          } bg-card/98 fixed top-full left-0 z-50 w-full rounded-lg shadow-lg shadow-black/10 backdrop-blur-3xl transition-all duration-200 ease-out dark:shadow-white/10`}
        >
          <MenuComponent />
          <div className="relative container mx-auto h-full p-8">
            <div className="absolute right-4 bottom-4 text-9xl font-bold text-black/10 dark:text-white/10">
              {item.label}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const DesktopNav = ({ items }: { items: NavItem[] }) => {
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(
    (menuKey: string) => {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        setCloseTimeout(null);
      }
      setOpenMenuKey(menuKey);
    },
    [closeTimeout]
  );

  const handleMouseLeave = useCallback(() => {
    const timeout = setTimeout(() => {
      setOpenMenuKey(null);
    }, 150);
    setCloseTimeout(timeout);
  }, []);

  return (
    <nav className="hidden items-center space-x-4 lg:flex">
      {items.map((item) => (
        <div key={item.menuKey || item.href}>
          {item.type === "link" ? (
            <Link href={item.href} className="hover:text-primary transition-colors duration-200">
              {item.label}
            </Link>
          ) : (
            <MenuButton
              item={item}
              isOpen={openMenuKey === item.menuKey}
              onMouseEnter={() => handleMouseEnter(item.menuKey || "")}
              onMouseLeave={handleMouseLeave}
            />
          )}
        </div>
      ))}
    </nav>
  );
};
