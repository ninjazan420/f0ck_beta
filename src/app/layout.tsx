import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "f0ck beta v1",
  description: "Deine neue Anlaufstelle für Catmemes, Shitposts, Girls und mehr. Eine Community-getriebene Plattform für Entertainment und Austausch.",
  keywords: ["memes", "community", "entertainment", "social", "sharing", "catmemes", "shitposts"],
  authors: [{ name: "f0ck.org Team" }],
  openGraph: {
    title: "f0ck beta v1 - Catmemes, Shitposts, Girls and more",
    description: "Deine neue Anlaufstelle für Catmemes, Shitposts, Girls und mehr. Eine Community-getriebene Plattform für Entertainment und Austausch.",
    url: "https://beta.f0ck.org",
    siteName: "f0ck beta v1",
    images: [
      {
        url: "/logos/1.png", // Nur ein Beispiel-Logo für die Metadaten
        width: 411,
        height: 84,
        alt: "f0ck.org Logo",
      }
    ],
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "f0ck beta v1",
    description: "Deine neue Anlaufstelle für Catmemes, Shitposts, Girls und mehr",
    images: ["/logos/1.png"],
  },
  metadataBase: new URL("https://beta.f0ck.org"),
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.png"
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
