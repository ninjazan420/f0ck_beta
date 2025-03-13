import dbConnect from '@/lib/db/mongodb';
import Tag from '@/models/Tag';
import Post from '@/models/Post';

export async function updateTagStats() {
  console.log('Starting scheduled tag statistics update...');
  
  try {
    await dbConnect();
    
    // Berechne Datum-Bereiche
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);
    
    // Hole alle Tags
    const tags = await Tag.find({});
    console.log(`Updating statistics for ${tags.length} tags...`);
    
    let updatedCount = 0;
    
    for (const tag of tags) {
      try {
        // Zähle Posts nach Zeitraum
        const [postsToday, postsThisWeek, totalPosts] = await Promise.all([
          Post.countDocuments({ tags: tag.name, createdAt: { $gte: today } }),
          Post.countDocuments({ tags: tag.name, createdAt: { $gte: weekStart } }),
          Post.countDocuments({ tags: tag.name })
        ]);
        
        // Aktualisiere den Tag
        await Tag.findByIdAndUpdate(tag._id, {
          newPostsToday: postsToday,
          newPostsThisWeek: postsThisWeek,
          postsCount: totalPosts
        });
        
        updatedCount++;
      } catch (tagError) {
        console.error(`Error updating tag ${tag.name}:`, tagError);
      }
    }
    
    console.log(`Successfully updated ${updatedCount} of ${tags.length} tags.`);
    return true;
  } catch (error) {
    console.error('Error in tag statistics update:', error);
    return false;
  }
} 