import { Metadata } from 'next';
import { PoolsPage } from "./components/PoolsPage";

export const metadata: Metadata = {
  title: 'Pools - f0ck beta v1',
  description: 'Browse collections and themed galleries',
  openGraph: {
    title: 'Pools - f0ck beta v1',
    description: 'Browse through our curated collections and themed galleries.',
  },
  twitter: {
    card: 'summary',
    title: 'Pools - f0ck beta v1',
    description: 'Browse collections and themed galleries',
  }
};

export default function Pools() {
  return <PoolsPage />;
}
