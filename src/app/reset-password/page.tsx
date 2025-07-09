import { Metadata } from "next";
import { siteConfig } from "../metadata";
import ResetPasswordClient from "./ResetPasswordClient";

export const metadata: Metadata = {
  title: `Reset Password | ${siteConfig.name}`,
  description: "Create a new password for your f0ck.org account",
  icons: {
    icon: [{ url: siteConfig.icon, type: "image/x-icon" }],
  },
};

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}