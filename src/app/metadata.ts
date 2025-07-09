import { Metadata } from "next";

// Allgemeine Konfiguration
export const siteConfig = {
  name: "f0ck.org - Anoymous Imageboard",
  description: "Discover f0ck.org, the anonymous imageboard. Share, rate & comment on images, videos and take part in creative cat memes. Enjoy full transparancy, anonymity and little to none moderation.",
  url: "https://f0ck.org",
  icon: "/favicon.ico",
};

// Funktion zur Erstellung von Metadaten
export function generateMetadata(title?: string, description?: string): Metadata {
  return {
    title: title ? `${title} | ${siteConfig.name}` : siteConfig.name,
    description: description || siteConfig.description,
    icons: {
      icon: [{ url: siteConfig.icon, type: "image/x-icon" }],
    },
  };
}
export default generateMetadata;