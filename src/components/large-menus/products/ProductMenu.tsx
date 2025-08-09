"use client";
import { DesktopProductMenu } from "./DesktopProductMenu";
import { MobileProductMenu } from "./MobileProductMenu";

interface ProductMenuProps {
  isMobile?: boolean;
  expandedCategory?: string | null;
  expandedSubCategory?: string | null;
  onSubCategoryClick?: (label: string) => void;
  onClose?: () => void;
}

export const ProductMenu = ({
  isMobile,
  expandedSubCategory,
  onSubCategoryClick,
  onClose,
}: ProductMenuProps) => {
  if (isMobile) {
    return (
      <MobileProductMenu
        expandedSubCategory={expandedSubCategory}
        onSubCategoryClick={onSubCategoryClick}
        onClose={onClose}
      />
    );
  }

  return <DesktopProductMenu />;
};
