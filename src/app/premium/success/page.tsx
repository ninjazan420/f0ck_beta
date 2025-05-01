import { Metadata } from "next";
import { siteConfig } from "../../metadata";
import SuccessClient from "./SuccessClient";

export const metadata: Metadata = {
  title: `Premium Activated | ${siteConfig.name}`,
  description: "Your premium membership has been activated",
  icons: {
    icon: [{ url: siteConfig.icon, type: "image/x-icon" }],
  },
};

export default function PremiumSuccess() {
  return <SuccessClient />;
}
