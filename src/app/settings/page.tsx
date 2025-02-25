import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import SettingsClient from "./SettingsClient";

export default async function Settings() {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role || 'user';
  return <SettingsClient userRole={userRole} />;
}
