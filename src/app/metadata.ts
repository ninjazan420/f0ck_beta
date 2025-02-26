import { Metadata } from "next";

// Allgemeine Konfiguration
export const siteConfig = {
  name: "f0ck.org",
  description: "Catmemes, Shitposts, Girls und mehr",
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