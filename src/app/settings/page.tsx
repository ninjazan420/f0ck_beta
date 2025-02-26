import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import SettingsClient from "./SettingsClient";
import { Metadata } from "next";
import { siteConfig } from "../metadata";

export const metadata: Metadata = {
  title: `Settings | ${siteConfig.name}`,
  description: "f0ck.org rules & help",
  icons: {
    icon: [{ url: siteConfig.icon, type: "image/x-icon" }],
  },
};

export default async function Settings() {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role || 'user';
  const validRole = ['user', 'premium', 'moderator', 'admin', 'banned'].includes(userRole) ? userRole as 'user' | 'premium' | 'moderator' | 'admin' | 'banned' : 'user';
  return <SettingsClient userRole={validRole} />;
}
