import { Metadata } from 'next';
import { CommentsPage } from "./components/CommentsPage";

export const metadata: Metadata = {
  title: 'Recent Comments - f0ck beta v1',
  description: 'Recent comments on f0ck.org',
  openGraph: {
    title: 'Recent Comments - f0ck beta v1',
    description: 'Recent comments on f0ck.org',
  },
  twitter: {
    card: 'summary',
    title: 'Recent Comments - f0ck beta v1',
    description: 'Recent comments on f0ck.org',
  }
};

export default function Comments() {
  return <CommentsPage />;
}
