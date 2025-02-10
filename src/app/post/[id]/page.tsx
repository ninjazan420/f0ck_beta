'use client';

import { useParams } from 'next/navigation';
import { Footer } from "@/components/Footer";
import { PostDetails } from "../../posts/components/PostDetails";
import { PostNavigation } from "../../posts/components/PostNavigation";

export default function PostPage() {
  const params = useParams();
  const postId = params.id as string;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-4 max-w-6xl flex-grow">
        <PostNavigation currentId={postId} />
        <div className="mt-6">
          <PostDetails postId={postId} />
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
