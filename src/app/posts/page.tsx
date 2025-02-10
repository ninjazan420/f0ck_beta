import { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Posts - f0ck beta v1",
  description: "Browse through posts"
};

export default function Posts() {
  return <ComingSoon pageName="Posts" />;
}
