import { MenuGroup } from "@/components/common/workspace/sidebar/types";
import { getMenuItems } from "@/staticData/user-menu";
import UserDashboard from "./UserDashboard";

export default async function UserHomePage() {
  const menuGroups = (await getMenuItems()) as MenuGroup[];
  return <UserDashboard menuGroups={menuGroups} />;
}
