import { useNavItems } from "@/staticData/menu";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";

export const Navigation = () => {
  const navItems = useNavItems();

  return (
    <div className="flex items-center space-x-4">
      <MobileNav items={navItems} />
      <DesktopNav items={navItems} />
    </div>
  );
};
