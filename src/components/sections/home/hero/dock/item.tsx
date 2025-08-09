"use client";

import { useDialog } from "../index";

export const DockItem = ({
  icon: Icon,
  label,
  component,
}: {
  icon: React.ElementType;
  label: string;
  component: React.ReactNode;
}) => {
  const { setIsOpen, setDialogContent, setDialogTitle } = useDialog();

  const handleClick = () => {
    setDialogTitle(label);
    setDialogContent(component);
    setIsOpen(true);
  };

  return (
    <div
      className="group relative flex cursor-pointer items-center justify-center"
      onClick={handleClick}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-xs transition-all duration-100 group-hover:scale-110 group-hover:bg-white/20 sm:h-10 sm:w-10 md:h-12 md:w-12">
        <Icon className="h-6 w-6 text-gray-800 sm:h-5 sm:w-5 md:h-6 md:w-6 dark:text-white" />
      </div>
      <span className="absolute -bottom-8 scale-0 rounded-md bg-white/80 px-2 py-1 text-sm text-gray-800 transition-all duration-300 group-hover:scale-100 sm:-bottom-7 sm:px-2 sm:py-1 sm:text-sm md:-bottom-8 dark:bg-black/80 dark:text-white">
        {label}
      </span>
    </div>
  );
};
