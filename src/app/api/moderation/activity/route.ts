import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import ModLog from '@/models/ModLog';

export async function GET(req: Request) {
  try {
    console.log("Moderation activity API called");
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || !['moderator', 'admin'].includes(session.user.role)) {
      console.log("Unauthorized access attempt to moderation activity");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const type = searchParams.get('type');
    const action = searchParams.get('action');
    const moderator = searchParams.get('moderator');

    // Ignore cache buster parameter
    // searchParams.get('_cache') is intentionally not used

    console.log("Parameters for activity query:", { page, limit, type, action, moderator });

    await dbConnect();
    console.log("Connected to database");

    // Build query
    const query: any = {};
    if (type) query.targetType = type;
    if (action) query.action = action;
    if (moderator) query.moderator = moderator;

    console.log("Executing query:", JSON.stringify(query));
    
    try {
      // Fetch activities
      const activities = await ModLog.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('moderator', 'username');
      
      const total = await ModLog.countDocuments(query);

      console.log(`${activities.length} activities found out of ${total} total`);
      console.log(`Activities:`, activities.map(a => ({ id: a._id, action: a.action, targetType: a.targetType })));

      // Format activities
      const formattedActivities = await Promise.all(activities.map(async (activity) => {
        // Basic activity information
        const formattedActivity: any = {
          id: activity._id,
          action: activity.action,
          targetType: activity.targetType,
          reason: activity.reason,
          moderator: activity.moderator?.username || 'Unknown Moderator',
          createdAt: activity.createdAt,
        };

        // Verbesserte Informationen über Zielobjekte
        try {
          if (activity.targetId) {
            let target = null;
            
            // Bei gelöschten Elementen, die Informationen aus den Metadaten extrahieren
            if (activity.action === 'delete' && activity.metadata?.previousState) {
              formattedActivity.target = {
                id: activity.targetId,
                type: activity.targetType
              };
              
              // Je nach Zieltyp unterschiedliche Informationen speichern
              if (activity.targetType === 'post') {
                formattedActivity.target.title = activity.metadata.previousState.title || 'Deleted Post';
                formattedActivity.target.numericId = activity.metadata.previousState.id;
                formattedActivity.target.imageUrl = activity.metadata.previousState.thumbnailUrl || 
                                                  activity.metadata.previousState.imageUrl;
              } 
              else if (activity.targetType === 'comment') {
                formattedActivity.target.content = activity.metadata.previousState.content || 'Deleted Comment';
              }
              else if (activity.targetType === 'tag') {
                formattedActivity.target.name = activity.metadata.previousState.name || 'Deleted Tag';
              }
              else if (activity.targetType === 'user') {
                formattedActivity.target.username = activity.metadata.previousState.username || 'Deleted User';
              }
            } 
            // Wenn es sich nicht um eine Löschaktion handelt, normale Objektsuche
            else {
              // Choose the right model based on targetType
              if (activity.targetType === 'post') {
                const Post = require('@/models/Post').default;
                target = await Post.findById(activity.targetId);
                
                if (target) {
                  formattedActivity.target = {
                    id: target._id,
                    numericId: target.id,
                    type: 'post',
                    title: target.title,
                    imageUrl: target.thumbnailUrl || target.imageUrl
                  };
                }
              } 
              else if (activity.targetType === 'comment') {
                const Comment = require('@/models/Comment').default;
                target = await Comment.findById(activity.targetId);
                
                if (target) {
                  formattedActivity.target = {
                    id: target._id,
                    type: 'comment',
                    content: target.content,
                    postId: target.post
                  };
                }
              }
              else if (activity.targetType === 'user') {
                const User = require('@/models/User').default;
                target = await User.findById(activity.targetId);
                
                if (target) {
                  formattedActivity.target = {
                    id: target._id,
                    type: 'user',
                    username: target.username
                  };
                }
              }
              else if (activity.targetType === 'tag') {
                const Tag = require('@/models/Tag').default;
                target = await Tag.findById(activity.targetId);
                
                if (target) {
                  formattedActivity.target = {
                    id: target._id,
                    type: 'tag',
                    name: target.name
                  };
                }
              }
              
              // Fallback, wenn Target nicht gefunden wurde
              if (!target && !formattedActivity.target) {
                formattedActivity.target = {
                  id: activity.targetId,
                  type: activity.targetType
                };
              }
            }
          }
        } catch (targetError) {
          console.error("Error loading target object:", targetError);
          // Fallback zu einfachen Informationen
          formattedActivity.target = {
            id: activity.targetId,
            type: activity.targetType
          };
        }

        return formattedActivity;
      }));

      // Successful response
      return NextResponse.json({
        activities: formattedActivities,
        pagination: {
          total: total,
          pages: Math.ceil(total / limit),
          current: page,
          limit
        }
      });
      
    } catch (dbError) {
      console.error("Database error in activity query:", dbError);
      throw new Error(`Database error: ${dbError instanceof Error ? dbError.message : 'Unknown database error'}`);
    }
    
  } catch (error) {
    console.error('Error fetching moderation activity:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
} 