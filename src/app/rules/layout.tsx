import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rules - f0ck beta v1",
  description: "Community rules and guidelines for f0ck beta v1.",
  icons: {
    icon: '/favicon.ico'
  }
};

export default function RulesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
