import { Metadata } from "next";
import { AccountCard } from "./components/AccountCard";
import { RandomLogo } from "@/components/RandomLogo";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Account - f0ck beta v1",
  description: "Your Account",
  icons: [
    {
      rel: 'icon',
      url: '/favicon.ico',
    },
  ],
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
