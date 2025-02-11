import { Metadata } from 'next';
import { UsersPage } from "./components/UsersPage";

export const metadata: Metadata = {
  title: 'Users - f0ck beta v1',
  description: 'Browse and discover our community members.',
  openGraph: {
    title: 'Community Members - f0ck beta v1',
    description: 'Discover content creators and community members.',
  },
  twitter: {
    card: 'summary',
    title: 'Users - f0ck beta v1',
    description: 'Browse and discover our community members.',
  }
};

export default function Users() {
  return <UsersPage />;
}
