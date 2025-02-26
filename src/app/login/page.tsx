import LoginClient from "./LoginClient";
import { Metadata } from "next";
import { siteConfig } from "../metadata";

export const metadata: Metadata = {
  title: `Rules | ${siteConfig.name}`,
  description: "f0ck.org rules & help",
  icons: {
    icon: [{ url: siteConfig.icon, type: "image/x-icon" }],
  },
};

// Die korrekte Typisierung für Next.js 15 Page Props verwenden
export default async function Login({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const isRegistered = searchParams?.registered === 'true';
  return <LoginClient registered={isRegistered} />;
}
