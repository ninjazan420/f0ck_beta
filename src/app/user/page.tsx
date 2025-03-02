import { ComingSoon } from "@/components/ComingSoon";
import { Metadata } from "next";
import { siteConfig } from "../metadata";

export const metadata: Metadata = {
  title: `Users | ${siteConfig.name}`,
  description: "Browse and discover users on f0ck.org",
  icons: {
    icon: [{ url: siteConfig.icon, type: "image/x-icon" }],
  },
};

export default function User() {
  return <ComingSoon pageName="User" />;
}
