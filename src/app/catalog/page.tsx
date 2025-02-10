import { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Catalog - f0ck beta v1",
  description: "Browse through our catalog",
  icons: {
    icon: '/favicon.ico'
  }
};

export default function Catalog() {
  return <ComingSoon pageName="Catalog" />;
}
