import { Metadata } from "next";
import { TagsPage } from "./components/TagsPage";

export const metadata: Metadata = {
  title: "Tags - f0ck beta v1",
  description: "Browse and discover tags. Filter by category, popularity, and more.",
  icons: {
    icon: '/favicon.ico'
  },
  keywords: ["tags", "categories", "search", "filter", "browse", "discover"],
  openGraph: {
    title: "Tag Browser - f0ck beta v1",
    description: "Explore our comprehensive tag system. Find content by categories, artists, and more.",
  }
};

export default function Tags() {
  return <TagsPage />;
}
