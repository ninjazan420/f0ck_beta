import PremiumClient from "./PremiumClient";
import { Metadata } from "next";
import { siteConfig } from "../metadata";

export const metadata: Metadata = {
  title: `Premium | ${siteConfig.name}`,
  description: "Upgrade to premium membership on f0ck.org",
  icons: {
    icon: [{ url: siteConfig.icon, type: "image/x-icon" }],
  },
};

export default function Premium() {
  return <PremiumClient />;
}
