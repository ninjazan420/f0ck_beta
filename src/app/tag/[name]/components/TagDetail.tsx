'use client';
import { useEffect, useState } from 'react';
import { TagModerator } from '@/app/tags/components/TagModerator';

interface TagDetailProps {
  tagName: string;
}

export function TagDetail({ tagName }: TagDetailProps) {
  const [tagData, setTagData] = useState<{
    id: string;
    name: string;
    postsCount: number;
    newPostsToday: number;
    newPostsThisWeek: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTagData() {
      try {
        const response = await fetch(`/api/tags/details?name=${encodeURIComponent(tagName)}`);
        if (response.ok) {
          const data = await response.json();
          setTagData(data.tag);
        } else {
          console.error('Error loading tag');
        }
      } catch (error) {
        console.error('Error fetching tag data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (tagName) {
      fetchTagData();
    }
  }, [tagName]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!tagData) {
    return <div>Tag not found</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        {tagData.name.replace(/_/g, ' ')}
      </h1>
      
      <div className="mb-6">
        <div className="text-lg">
          {tagData.postsCount} Posts
          {tagData.newPostsToday > 0 && ` (+${tagData.newPostsToday} today)`}
          {tagData.newPostsThisWeek > tagData.newPostsToday && 
            ` (+${tagData.newPostsThisWeek - tagData.newPostsToday} this week)`}
        </div>
      </div>
      
      {/* Moderation tools */}
      <TagModerator tagId={tagData.id} tagName={tagData.name} />
      
      {/* Add more tag content here */}
    </div>
  );
} 