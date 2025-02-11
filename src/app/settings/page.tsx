import { Metadata } from 'next';
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = {
  title: 'Einstellungen - f0ck beta v1',
  description: 'Passe deine f0ck.org Einstellungen an',
  openGraph: {
    title: 'Einstellungen - f0ck beta v1',
    description: 'Passe deine f0ck.org Einstellungen an',
  },
  twitter: {
    card: 'summary',
    title: 'Einstellungen - f0ck beta v1',
    description: 'Passe deine f0ck.org Einstellungen an',
  }
};

export default function Settings() {
  return <SettingsClient />;
}
