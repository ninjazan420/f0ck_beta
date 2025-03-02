import { CommentsPage } from "./components/CommentsPage";
import { Metadata } from "next";
import { siteConfig } from "../metadata";

export const metadata: Metadata = {
  title: `Comments | ${siteConfig.name}`,
  description: "Explore and manage comments on f0ck.org",
  icons: {
    icon: [{ url: siteConfig.icon, type: "image/x-icon" }],
  },
};

export default function Comments() {
  return <CommentsPage />;
}
