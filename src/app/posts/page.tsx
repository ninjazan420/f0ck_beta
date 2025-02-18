import { Metadata } from 'next';
import { PostsPage } from "./components/PostsPage";

export const metadata: Metadata = {
  title: 'Posts - f0ck beta v1',
  description: 'Browse through posts',
  openGraph: {
    title: 'Posts - f0ck beta v1',
    description: 'Browse through posts',
  },
  twitter: {
    card: 'summary',
    title: 'Posts - f0ck beta v1',
    description: 'Browse through posts',
  }
};

export default function Posts() {
  return <PostsPage />;
}
