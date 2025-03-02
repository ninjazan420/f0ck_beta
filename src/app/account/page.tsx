import { AccountCard } from "./components/AccountCard";
import { RandomLogo } from "@/components/RandomLogo";
import { Footer } from "@/components/Footer";
import { Metadata } from "next";
import { siteConfig } from "../metadata";

export const metadata: Metadata = {
  title: `Account | ${siteConfig.name}`,
  description: "Manage your f0ck.org account",
  icons: {
    icon: [{ url: siteConfig.icon, type: "image/x-icon" }],
  },
};

export default function Account() {
  return (
    <div className="min-h-[calc(100vh-36.8px)] flex flex-col">
      <div className="w-full flex justify-center py-8">
        <RandomLogo />
      </div>
      
      <div className="container mx-auto px-4 py-4 max-w-4xl flex-grow">
        <AccountCard />
      </div>
      
      <Footer />
    </div>
  );
}
