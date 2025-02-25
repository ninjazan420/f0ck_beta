import { Metadata } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = {
  title: 'Einstellungen - f0ck beta v1',
  description: 'Passe deine f0ck.org Einstellungen an',
  openGraph: {
    title: 'Einstellungen - f0ck beta v1',
    description: 'Passe deine f0ck.org Einstellungen an',
  },
  twitter: {
    card: 'summary',
    title: 'Einstellungen - f0ck beta v1',
    description: 'Passe deine f0ck.org Einstellungen an',
  }
};

export default async function Settings() {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role || 'user';
  return <SettingsClient userRole={userRole} />;
}
