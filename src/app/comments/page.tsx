import { CommentsPage } from "./components/CommentsPage";
import { Metadata } from "next";
import { siteConfig } from "../metadata";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: `Comments | ${siteConfig.name}`,
  description: "Explore and manage comments on f0ck.org",
  icons: {
    icon: [{ url: siteConfig.icon, type: "image/x-icon" }],
  },
};

function CommentsPageFallback() {
  return <div className="p-4 text-center">Loading comments...</div>;
}

export default function Comments() {
  return (
    <Suspense fallback={<CommentsPageFallback />}>
      <CommentsPage />
    </Suspense>
  );
}
