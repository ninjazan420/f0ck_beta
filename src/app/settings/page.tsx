import { Metadata } from "next";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = {
  title: "Settings - f0ck beta v1",
  description: "Customize your f0ck.org experience",
  icons: {
    icon: '/favicon.ico'
  }
};

export default function Settings() {
  return <SettingsClient />;
}
