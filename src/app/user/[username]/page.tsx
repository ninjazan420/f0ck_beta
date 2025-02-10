'use client';

import { useParams } from 'next/navigation';
import { RandomLogo } from "@/components/RandomLogo";
import { Footer } from "@/components/Footer";
import { UserProfile } from "../components/UserProfile";

export default function UserPage() {
  const params = useParams();
  const username = params.username as string;

  return (
    <div className="min-h-[calc(100vh-36.8px)] flex flex-col">
      <div className="w-full flex justify-center py-8">
        <RandomLogo />
      </div>
      
      <div className="container mx-auto px-4 py-4 max-w-4xl flex-grow">
        <UserProfile username={username} />
      </div>
      
      <Footer />
    </div>
  );
}
