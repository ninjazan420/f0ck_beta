import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Post from '@/models/Post';
import Comment from '@/models/Comment';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Holen Sie die ersten 10 Posts
    const posts = await Post.find().limit(10).select('_id id stats');
    const postIds = posts.map(p => p._id);

    // Zählen Sie die Kommentare für diese Posts (nur genehmigte)
    const commentCounts = await Comment.aggregate([
      {
        $match: {
          post: { $in: postIds },
          status: 'approved'
        }
      },
      { $group: { _id: '$post', count: { $sum: 1 } } }
    ]);

    // Format für die Antwort
    const result = {
      posts: posts.map(post => ({
        id: post.id || post._id.toString(),
        currentStats: post.stats || { likes: 0, views: 0, comments: 0, favorites: 0 },
        commentCount: commentCounts.find(c => c._id.toString() === post._id.toString())?.count || 0
      }))
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in debug-stats route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}