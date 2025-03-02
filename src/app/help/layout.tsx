import { Metadata } from '@/types/metadata';

export const metadata: Metadata = {
  title: "Help | f0ck.org",
  description: "Help center and documentation for f0ck.org",
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
