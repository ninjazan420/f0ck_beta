import { Metadata } from "next";
import { UploadPageClient } from "./components/UploadPageClient";

export const metadata: Metadata = {
  title: "Upload - f0ck beta v1",
  description: "Upload deine Medien zu f0ck.org - Unterstützt Bilder, GIFs und Videos.",
  icons: {
    icon: '/favicon.ico'
  }
};

export default function Upload() {
  return <UploadPageClient />;
}
