import RegisterClient from "./RegisterClient";
import { Metadata } from "next";
import { siteConfig } from "../metadata";

export const metadata: Metadata = {
  title: `Register | ${siteConfig.name}`,
  description: "Create a new account on f0ck.org",
  icons: {
    icon: [{ url: siteConfig.icon, type: "image/x-icon" }],
  },
};

export default function Register() {
  return <RegisterClient />;
}
