import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import ModLog from '@/models/ModLog';
import Post from '@/models/Post';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || !['moderator', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const action = searchParams.get('action');
    const moderator = searchParams.get('moderator');

    await dbConnect();

    // Query aufbauen
    const query: any = {};
    if (type) query.targetType = type;
    if (action) query.action = action;
    if (moderator) query.moderator = moderator;

    // Aktivitäten abrufen mit Pagination
    const [activities, total] = await Promise.all([
      ModLog.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('moderator', 'username')
        .populate({
          path: 'targetId',
          options: { strictPopulate: false } // Vermeidet Fehler bei Dokumenten, die nicht mehr existieren
        }),
      ModLog.countDocuments(query)
    ]);

    // Neue Posts der letzten 24 Stunden abrufen
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const recentPosts = await Post.find({
      createdAt: { $gte: oneDayAgo }
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('author', 'username');

    // Uploads in ein Format konvertieren, das mit dem ModLog kompatibel ist
    const uploadActivities = recentPosts.map(post => ({
      _id: `upload-${post._id}`,
      action: 'upload',
      targetType: 'post',
      reason: 'Neuer Upload',
      moderator: post.author ? { username: post.author.username } : { username: 'Unbekannter Benutzer' },
      createdAt: post.createdAt,
      targetId: post
    }));

    // Aktivitäten und Uploads kombinieren und nach Datum sortieren
    const combinedActivities = [...activities, ...uploadActivities]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    // Aktivitäten formatieren
    const formattedActivities = combinedActivities.map(activity => {
      // Basis-Aktivitätsinformationen
      const formattedActivity: any = {
        id: activity._id,
        action: activity.action,
        targetType: activity.targetType,
        reason: activity.reason,
        moderator: activity.moderator?.username || 'Unbekannter Moderator',
        createdAt: activity.createdAt,
        metadata: activity.metadata
      };

      // Ziel-spezifische Informationen hinzufügen, falls verfügbar
      if (activity.targetId) {
        formattedActivity.target = {
          id: activity.targetId._id,
          type: activity.targetType
        };

        // Typspezifische Eigenschaften hinzufügen
        switch (activity.targetType) {
          case 'user':
            if (activity.targetId.username) {
              formattedActivity.target.username = activity.targetId.username;
            }
            break;
          case 'comment':
            if (activity.targetId.content) {
              formattedActivity.target.content = activity.targetId.content;
            }
            // Post-ID für den Kommentar hinzufügen (für Verlinkung)
            if (activity.targetId.post) {
              // Wenn post ein Objekt ist mit _id und id
              if (typeof activity.targetId.post === 'object' && activity.targetId.post) {
                formattedActivity.target.postId = activity.targetId.post.id || activity.targetId.post._id;
              } else {
                // Wenn post direkt eine ID ist
                formattedActivity.target.postId = activity.targetId.post;
              }
            }
            break;
          case 'post':
            if (activity.targetId.title) {
              formattedActivity.target.title = activity.targetId.title;
            }
            // Bei Uploads auch die Thumbnail-URL hinzufügen
            if (activity.targetId.thumbnailUrl) {
              formattedActivity.target.imageUrl = activity.targetId.thumbnailUrl;
            } else if (activity.targetId.imageUrl) {
              formattedActivity.target.imageUrl = activity.targetId.imageUrl;
            }
            // Numerische ID für Posts hinzufügen
            if (activity.targetId.id) {
              formattedActivity.target.numericId = activity.targetId.id;
            } else if (activity.targetId.numericId) {
              formattedActivity.target.numericId = activity.targetId.numericId;
            }
            break;
        }
      } else {
        // Falls das Ziel nicht mehr existiert, aber Metadaten vorhanden sind
        formattedActivity.target = {
          id: activity.metadata?.previousState?._id || 'gelöscht',
          type: activity.targetType
        };
        
        // Versuchen, Informationen aus den Metadaten zu extrahieren
        if (activity.metadata && activity.metadata.previousState) {
          const previousState = activity.metadata.previousState;
          
          switch (activity.targetType) {
            case 'user':
              if (previousState.username) {
                formattedActivity.target.username = previousState.username;
              }
              break;
            case 'comment':
              if (previousState.content) {
                formattedActivity.target.content = previousState.content;
              }
              // Post-ID aus dem vorherigen Zustand extrahieren (für Verlinkung)
              if (previousState.post) {
                // Wenn post ein Objekt ist
                if (typeof previousState.post === 'object' && previousState.post) {
                  formattedActivity.target.postId = previousState.post.id || previousState.post._id;
                } else {
                  // Wenn post direkt eine ID ist
                  formattedActivity.target.postId = previousState.post;
                }
              }
              break;
            case 'post':
              if (previousState.title) {
                formattedActivity.target.title = previousState.title;
              }
              // Numerische ID für Posts hinzufügen
              if (previousState.id) {
                formattedActivity.target.numericId = previousState.id;
              } else if (previousState.numericId) {
                formattedActivity.target.numericId = previousState.numericId;
              }
              break;
          }
        }
      }

      return formattedActivity;
    });

    return NextResponse.json({
      activities: formattedActivities,
      pagination: {
        total: total + uploadActivities.length, // Für korrekte Gesamtzahl
        pages: Math.ceil((total + uploadActivities.length) / limit),
        current: page,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching moderation activity:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 