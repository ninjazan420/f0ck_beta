import { Metadata } from "next";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = {
  title: "Einstellungen - f0ck beta v1",
  description: "Passe deine f0ck.org Einstellungen an",
  icons: {
    icon: '/favicon.ico'
  }
};

export default function Settings() {
  return <SettingsClient />;
}
