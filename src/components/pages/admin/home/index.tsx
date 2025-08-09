import { MenuGroup } from "@/components/common/workspace/sidebar/types";
import { getMenuItems } from "@/staticData/admin-menu";
import AdminDashboard from "./AdminDashboard";

export default async function AdminHomePage() {
  const menuGroups = (await getMenuItems()) as MenuGroup[];
  return <AdminDashboard menuGroups={menuGroups} />;
}
