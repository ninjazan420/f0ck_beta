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

        // Try to find the target object
        try {
          if (activity.targetId) {
            let target = null;
            
            // Choose the right model based on targetType
            if (activity.targetType === 'post') {
              const Post = require('@/models/Post').default;
              target = await Post.findById(activity.targetId);
              
              if (!target && activity.metadata?.previousState) {
                // If post was deleted, use metadata
                formattedActivity.target = {
                  id: activity.targetId,
                  type: 'post',
                  title: activity.metadata.previousState.title || 'Deleted Post'
                };
              } else if (target) {
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
              
              if (!target && activity.metadata?.previousState) {
                // If comment was deleted, use metadata
                formattedActivity.target = {
                  id: activity.targetId,
                  type: 'comment',
                  content: activity.metadata.previousState.content || 'Deleted Comment'
                };
              } else if (target) {
                formattedActivity.target = {
                  id: target._id,
                  type: 'comment',
                  content: target.content
                };
              }
            }
            else if (activity.targetType === 'user') {
              const User = require('@/models/User').default;
              target = await User.findById(activity.targetId);
              
              if (!target && activity.metadata?.previousState) {
                // If user was deleted, use metadata
                formattedActivity.target = {
                  id: activity.targetId,
                  type: 'user',
                  username: activity.metadata.previousState.username || 'Deleted User'
                };
              } else if (target) {
                formattedActivity.target = {
                  id: target._id,
                  type: 'user',
                  username: target.username
                };
              }
            }
            
            // If target not found and no target set yet
            if (!target && !formattedActivity.target) {
              formattedActivity.target = {
                id: activity.targetId,
                type: activity.targetType
              };
            }
          }
        } catch (targetError) {
          console.error("Error loading target object:", targetError);
          // Fallback to simple target information
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