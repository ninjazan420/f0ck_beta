import { Metadata } from "next";
import { siteConfig } from "../metadata";

export const metadata: Metadata = {
  title: `Moderation | ${siteConfig.name}`,
  description: "Moderation dashboard for f0ck.org administrators",
  icons: {
    icon: [{ url: siteConfig.icon, type: "image/x-icon" }],
  },
};

export default function ModerationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 