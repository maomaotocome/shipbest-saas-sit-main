"use client";
import { DesktopModelMenu } from "./DesktopModelMenu";
import { MobileModelMenu } from "./MobileModelMenu";

interface ModelMenuProps {
  isMobile?: boolean;
  expandedCategory?: string | null;
  expandedSubCategory?: string | null;
  onSubCategoryClick?: (label: string) => void;
  onClose?: () => void;
}

export const ModelMenu = ({
  isMobile,
  expandedSubCategory,
  onSubCategoryClick,
  onClose,
}: ModelMenuProps) => {
  if (isMobile) {
    return (
      <MobileModelMenu
        expandedSubCategory={expandedSubCategory}
        onSubCategoryClick={onSubCategoryClick}
        onClose={onClose}
      />
    );
  }

  return <DesktopModelMenu />;
};
