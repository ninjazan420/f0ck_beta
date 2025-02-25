import { withAuth, createErrorResponse } from '@/lib/api-utils';
import dbConnect from '@/lib/db/mongodb';
import Post from '@/models/Post';

export async function POST(req: Request) {
  return withAuth(async (session) => {
    const { title, content, mediaUrl, mediaType, tags, isNSFW } = await req.json();
    
    if (!title || !content || !mediaUrl || !mediaType) {
      return createErrorResponse('Title, content, mediaUrl and mediaType are required');
    }

    await dbConnect();
    const post = await Post.create({
      title,
      content,
      mediaUrl,
      mediaType, 
      tags: tags || [],
      isNSFW: isNSFW || false,
      author: session.user.id
    });

    return { message: 'Post created successfully', post };
  });
}

export async function GET() {
  return withAuth(async () => {
    await dbConnect();
    const posts = await Post.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(50);

    return posts;
  });
}
