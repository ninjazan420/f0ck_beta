import { Metadata } from "next";
import { PoolsPage } from "./components/PoolsPage";

export const metadata: Metadata = {
  title: "Pools - f0ck beta v1",
  description: "Browse curated collections and albums. Discover themed galleries and series.",
  keywords: ["pools", "collections", "albums", "galleries", "series", "curated"],
  openGraph: {
    title: "Image Pools - f0ck beta v1",
    description: "Browse through our curated collections and themed galleries.",
  }
};

export default function Pools() {
  return <PoolsPage />;
}
