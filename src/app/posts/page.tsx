import { Metadata } from "next";
import { PostsPage } from "./components/PostsPage";

export const metadata: Metadata = {
  title: "Posts - f0ck beta v1",
  description: "Browse through posts",
  icons: {
    icon: '/favicon.ico'
  }
};

export default function Posts() {
  return <PostsPage />;
}
