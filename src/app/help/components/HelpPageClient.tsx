'use client';

import { RandomLogo } from "@/components/RandomLogo";
import { Footer } from "@/components/Footer";
import { HelpContent } from "./HelpContent";

export function HelpPageClient() {
  return (
    <div className="min-h-[calc(100vh-36.8px)] flex flex-col">
      <div className="w-full flex justify-center py-8">
        <RandomLogo />
      </div>

      <div className="container mx-auto px-4 py-4 max-w-4xl flex-grow">
        <HelpContent />
      </div>
      
      <Footer />
    </div>
  );
}
