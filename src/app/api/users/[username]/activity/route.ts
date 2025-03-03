import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import Comment from '@/models/Comment';
import Post from '@/models/Post';

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    await dbConnect();

    // Warte auf die Auflösung der params
    const resolvedParams = await Promise.resolve(params);
    const username = resolvedParams.username;

    console.log('Suche Benutzer:', username);

    const user = await User.findOne({ username: username });
    if (!user) {
      console.log('Benutzer nicht gefunden:', username);
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 });
    }

    console.log('Benutzer gefunden:', user._id);

    // Kommentare des Benutzers abrufen
    const comments = await Comment.find({ 
      author: user._id,
      status: 'approved'
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('post', 'title imageUrl thumbnailUrl contentRating');

    // Posts des Benutzers abrufen
    const posts = await Post.find({
      author: user._id
    })
    .sort({ createdAt: -1 })
    .limit(5);

    // Liked Posts abrufen (falls im User-Schema gespeichert)
    const userWithLikes = await User.findById(user._id)
      .populate({
        path: 'likes',
        model: 'Post',
        select: 'title imageUrl thumbnailUrl contentRating createdAt',
        options: { sort: { createdAt: -1 }, limit: 5 }
      });

    // Alle Aktivitäten kombinieren
    let activities = [];

    // Kommentar-Aktivitäten
    if (comments && comments.length > 0) {
      activities = activities.concat(comments.map(comment => {
        // Stelle sicher, dass wir den Post richtig abbilden
        let postId = null;
        if (comment.post) {
          if (typeof comment.post === 'object') {
            // Wenn es ein Objekt ist, versuche die numerische ID oder _id zu verwenden
            postId = comment.post.id || comment.post._id;
          } else {
            // Wenn es eine direkte Referenz ist
            postId = comment.post;
          }
        }

        return {
          id: comment._id.toString(),
          type: 'comment',
          text: `Left a comment`,
          content: comment.content,
          date: comment.createdAt,
          emoji: '💬',
          post: {
            id: postId,
            title: comment.post?.title || 'Unknown Post',
            imageUrl: comment.post?.thumbnailUrl || comment.post?.imageUrl
          }
        };
      }));
    }

    // Post-Aktivitäten
    if (posts && posts.length > 0) {
      activities = activities.concat(posts.map(post => ({
        id: post._id.toString(),
        type: 'post',
        text: `Uploaded an image`,
        date: post.createdAt,
        emoji: '🖼️',
        post: {
          // Nutze die numerische ID, wenn verfügbar, sonst die Mongo-ID
          id: post.id || post._id.toString(),
          title: post.title,
          imageUrl: post.thumbnailUrl || post.imageUrl
        }
      })));
    }

    // Like-Aktivitäten
    if (userWithLikes?.likes && userWithLikes.likes.length > 0) {
      activities = activities.concat(userWithLikes.likes.map((post: any) => ({
        id: `like-${post._id}`,
        type: 'like',
        text: `Liked an image`,
        date: post.createdAt,
        emoji: '❤️',
        post: {
          // Nutze die numerische ID, wenn verfügbar, sonst die Mongo-ID
          id: post.id || post._id.toString(),
          title: post.title,
          imageUrl: post.thumbnailUrl || post.imageUrl
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
      { error: 'Fehler beim Abrufen der Benutzeraktivität' },
      { status: 500 }
    );
  }
} 