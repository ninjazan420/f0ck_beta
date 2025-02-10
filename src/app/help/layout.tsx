import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help - f0ck beta v1",
  description: "Help and documentation for f0ck beta v1.",
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
