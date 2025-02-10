import { Metadata } from 'next';
import { Footer } from "@/components/Footer";
import { PostDetails } from "../../posts/components/PostDetails";
import { PostNavigation } from "../../posts/components/PostNavigation";

// Mock function to fetch post data (replace with your actual data fetching)
async function getPost(id: string) {
  // Simulate API call - replace with real API call
  return {
    id,
    title: "Amazing Artwork #1",
    description: "This is a beautiful piece of art that I found.",
    imageUrl: "https://picsum.photos/1200/800",
    uploader: { name: "User1" },
    contentRating: "safe",
  };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> | { id: string } }): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.id);
  
  return {
    title: `${post.title} - f0ck beta v1`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: [
        {
          url: post.imageUrl,
          width: 1200,
          height: 800,
          alt: post.title,
        },
      ],
      type: 'article',
      authors: [post.uploader.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [post.imageUrl],
    }
  };
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await params;
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-4 max-w-6xl flex-grow">
        <PostNavigation currentId={resolvedParams.id} />
        <div className="mt-6">
          <PostDetails postId={resolvedParams.id} />
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
