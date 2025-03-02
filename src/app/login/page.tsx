import LoginClient from "./LoginClient";
import { Metadata } from "next";
import { siteConfig } from "../metadata";

export const metadata: Metadata = {
  title: `Login | ${siteConfig.name}`,
  description: "Login to your account",
  icons: {
    icon: [{ url: siteConfig.icon, type: "image/x-icon" }],
  },
};

export default async function Login({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Warten auf die Auflösung der searchParams
  const params = await Promise.resolve(searchParams);
  const isRegistered = params?.registered === 'true';
  
  return <LoginClient registered={isRegistered} />;
}
