import { PoolsPage } from "./components/PoolsPage";
import { Metadata } from "next";
import { siteConfig } from "../metadata";

export const metadata: Metadata = {
  title: `Pools | ${siteConfig.name}`,
  description: "Browse and discover content collections on f0ck.org",
  icons: {
    icon: [{ url: siteConfig.icon, type: "image/x-icon" }],
  },
};

export default function Pools() {
  return <PoolsPage />;
}
