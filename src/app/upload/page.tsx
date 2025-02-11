import { Metadata } from 'next';
import { UploadPageClient } from "./components/UploadPageClient";

export const metadata: Metadata = {
  title: 'Upload - f0ck beta v1',
  description: 'Upload deine Medien zu f0ck.org - Unterstützt Bilder, GIFs und Videos.',
  openGraph: {
    title: 'Upload - f0ck beta v1',
    description: 'Upload deine Medien zu f0ck.org - Unterstützt Bilder, GIFs und Videos.',
  },
  twitter: {
    card: 'summary',
    title: 'Upload - f0ck beta v1',
    description: 'Upload deine Medien zu f0ck.org - Unterstützt Bilder, GIFs und Videos.',
  }
};

export default function Upload() {
  return <UploadPageClient />;
}
