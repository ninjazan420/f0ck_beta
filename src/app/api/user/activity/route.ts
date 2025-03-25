import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Comment from '@/models/Comment';
import Post from '@/models/Post';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Kommentare des Benutzers abrufen
    const comments = await Comment.find({ 
      author: session.user.id,
      status: 'approved',
      isHidden: false 
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('post', 'title imageUrl thumbnailUrl contentRating numericId id _id');

    // Posts des Benutzers abrufen
    const posts = await Post.find({
      author: session.user.id
    })
    .sort({ createdAt: -1 })
    .limit(5);

    // Liked Posts abrufen (falls im User-Schema gespeichert)
    const userWithLikes = await User.findById(session.user.id)
      .populate({
        path: 'likes',
        model: 'Post',
        select: 'title imageUrl thumbnailUrl contentRating createdAt',
        options: { sort: { createdAt: -1 }, limit: 5 }
      });

    // Alle Aktivitäten kombinieren
    interface ActivityItem {
      id: string;
      type: 'comment' | 'post' | 'like';
      text: string;
      content?: string;
      date: string;
      emoji: string;
      post: {
        id: string;
        numericId?: string | number;
        title: string;
        imageUrl?: string;
        type?: 'image' | 'video' | 'gif';
      };
    }

    let activities: ActivityItem[] = [];

    // Kommentar-Aktivitäten
    if (comments && comments.length > 0) {
      // Stelle sicher, dass alle benötigten Posts mit numericId verfügbar sind
      const processedComments = await Promise.all(comments.map(async (comment) => {
        // Stelle sicher, dass wir den Post richtig abbilden
        let postId = null;
        let postNumericId = null;
        
        if (comment.post) {
          if (typeof comment.post === 'object') {
            // Wenn der Post ein Objekt ist, bevorzuge numericId
            postNumericId = comment.post.numericId || comment.post.id;
            postId = comment.post._id;
          } else {
            // Wenn es eine direkte Referenz ist
            postId = comment.post;
            
            // Versuchen, den Post zu finden und die numericId zu extrahieren
            try {
              const relatedPost = await Post.findById(comment.post);
              if (relatedPost) {
                postNumericId = relatedPost.numericId || relatedPost.id;
              }
            } catch (err) {
              console.error('Error fetching related post:', err);
            }
          }
        }

        return {
          comment,
          postData: {
            id: postId,
            numericId: postNumericId
          }
        };
      }));

      activities = activities.concat(processedComments.map(({comment, postData}) => {
        return {
          id: comment._id.toString(),
          type: 'comment',
          text: `You left a comment`,
          content: comment.content,
          date: comment.createdAt,
          emoji: '💬',
          post: {
            id: postData.id, // Original MongoDB ID beibehalten
            numericId: postData.numericId, // Numerische ID explizit setzen
            title: comment.post?.title || 'Unknown Post',
            imageUrl: comment.post?.thumbnailUrl || comment.post?.imageUrl,
            type: comment.post?.type || 'image'
          }
        };
      }));
    }

    // Post-Aktivitäten
    if (posts && posts.length > 0) {
      activities = activities.concat(posts.map(post => ({
        id: post._id.toString(),
        type: 'post',
        text: post.type === 'video' ? `You uploaded a video` : `You uploaded an image`,
        date: post.createdAt,
        emoji: '🖼️',
        post: {
          // Nutze die numerische ID, wenn verfügbar, sonst die Mongo-ID
          id: post.numericId || post.id || post._id.toString(),
          title: post.title,
          imageUrl: post.thumbnailUrl || post.imageUrl,
          type: post.type || 'image'
        }
      })));
    }

    // Like-Aktivitäten
    if (userWithLikes?.likes && userWithLikes.likes.length > 0) {
      activities = activities.concat(userWithLikes.likes.map((post: any) => ({
        id: `like-${post._id}`,
        type: 'like',
        text: post.type === 'video' ? `You liked a video` : `You liked an image`,
        date: post.createdAt,
        emoji: '❤️',
        post: {
          // Nutze die numerische ID, wenn verfügbar, sonst die Mongo-ID
          id: post.numericId || post.id || post._id.toString(),
          title: post.title,
          imageUrl: post.thumbnailUrl || post.imageUrl,
          type: post.type || 'image'
        }
      })));
    }

    // Nach Datum sortieren (neueste zuerst)
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Auf 10 Aktivitäten begrenzen
    activities = activities.slice(0, 10);

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Fehler beim Abrufen der Benutzeraktivität:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}