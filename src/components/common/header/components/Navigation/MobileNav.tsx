import { NavItem } from "@/staticData/menu";
import { ChevronDown, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { createPortal } from "react-dom";
import { LocaleSwitcher } from "../LocaleSwitcher";
import { NotificationIcon } from "../NotificationIcon";
import { ThemeSwitcher } from "../ThemeSwitcher";

interface MobileNavProps {
  items: NavItem[];
}

export const MobileNav = ({ items }: MobileNavProps) => {
  const t = useTranslations("common.navigation");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedSubCategory, setExpandedSubCategory] = useState<string | null>(null);

  const handleCategoryClick = (menuKey: string) => {
    if (expandedCategory === menuKey) {
      setExpandedCategory(null);
      setExpandedSubCategory(null);
    } else {
      setExpandedCategory(menuKey);
      setExpandedSubCategory(null);
    }
  };

  const handleSubCategoryClick = (categoryLabel: string) => {
    setExpandedSubCategory(expandedSubCategory === categoryLabel ? null : categoryLabel);
  };

  const handleClose = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="lg:hidden">
      {isMenuOpen &&
        createPortal(
          <div
            className={`bg-background fixed top-0 right-0 h-[calc(100vh)] w-full transform transition-transform duration-600 ease-in-out ${
              isMenuOpen ? "translate-x-0" : "translate-x-full"
            } z-[100] overflow-y-auto shadow-lg`}
          >
            <div className="flex items-center justify-between px-4 py-2">
              <button
                className="hover:bg-accent hover:text-accent-foreground rounded-lg p-2"
                aria-label={t("closeMenu")}
                onClick={handleClose}
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center">
                <ThemeSwitcher />
                <LocaleSwitcher />
                <NotificationIcon />
              </div>
            </div>
            <div className="flex h-full flex-col px-4 pt-2">
              <nav className="space-y-4">
                {items.map((item) => (
                  <div key={item.menuKey || item.href}>
                    {item.type === "link" ? (
                      <Link
                        href={item.href}
                        className="hover:text-primary block py-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={() => handleCategoryClick(item.menuKey || "")}
                          className="flex w-full items-center justify-between py-2"
                        >
                          <span>{item.label}</span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              expandedCategory === item.menuKey ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {expandedCategory === item.menuKey && item.largeMenu && (
                          <item.largeMenu
                            isMobile
                            expandedCategory={expandedCategory}
                            expandedSubCategory={expandedSubCategory}
                            onSubCategoryClick={handleSubCategoryClick}
                            onClose={handleClose}
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>,
          document.body
        )}

      <div className="relative">
        <button
          className="hover:bg-accent hover:text-accent-foreground z-[100] rounded-lg p-2"
          aria-label={t("openMenu")}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
