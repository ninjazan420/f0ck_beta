import { Metadata } from 'next';
import { HelpPageClient } from "./components/HelpPageClient";

export const metadata: Metadata = {
  title: 'Help & Features - f0ck beta v1',
  description: "Learn more about f0ck.org's features and functionality",
  openGraph: {
    title: 'Help & Features - f0ck beta v1',
    description: "Learn more about f0ck.org's features and functionality",
  },
  twitter: {
    card: 'summary',
    title: 'Help & Features - f0ck beta v1',
    description: "Learn more about f0ck.org's features and functionality",
  }
};

export default function Help() {
  return <HelpPageClient />;
}
