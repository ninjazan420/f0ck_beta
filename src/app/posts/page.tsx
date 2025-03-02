import { PostsPage } from "./components/PostsPage";
import { Metadata } from "next";
import { siteConfig } from "../metadata";

export const metadata: Metadata = {
  title: `Posts | ${siteConfig.name}`,
  description: "Browse and discover content on f0ck.org",
  icons: {
    icon: [{ url: siteConfig.icon, type: "image/x-icon" }],
  },
};

export default function Posts() {
  return <PostsPage />;
}
