import { Metadata } from "next";
import { siteConfig } from "../metadata";

export const metadata: Metadata = {
  title: `Upload | ${siteConfig.name}`,
  description: "Upload and share content on f0ck.org",
  icons: {
    icon: [{ url: siteConfig.icon, type: "image/x-icon" }],
  },
};

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 