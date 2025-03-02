import { TagsPage } from "./components/TagsPage";
import { Metadata } from "next";
import { siteConfig } from "../metadata";

export const metadata: Metadata = {
  title: `Tags | ${siteConfig.name}`,
  description: "Browse and discover content by tags on f0ck.org",
  icons: {
    icon: [{ url: siteConfig.icon, type: "image/x-icon" }],
  },
};

export default function Tags() {
  return <TagsPage />;
}
