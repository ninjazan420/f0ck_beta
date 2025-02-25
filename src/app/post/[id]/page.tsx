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

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-4 max-w-6xl flex-grow">
        <PostNavigation currentId={id} />
        <div className="mt-6">
          <PostDetails postId={id} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
