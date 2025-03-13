import { PostsPage } from "./components/PostsPage";
import { Metadata } from "next";
import { siteConfig } from "../metadata";
import { Suspense } from "react";
import { PostsWithTagCheck } from './components/PostsWithTagCheck';

export const metadata: Metadata = {
  title: `Posts | ${siteConfig.name}`,
  description: "Browse and discover content on f0ck.org",
  icons: {
    icon: [{ url: siteConfig.icon, type: "image/x-icon" }],
  },
};

export default function Posts() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading posts...</div>}>
      <PostsWithTagCheck>
        <PostsPage />
      </PostsWithTagCheck>
    </Suspense>
  );
}
