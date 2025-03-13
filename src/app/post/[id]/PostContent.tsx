'use client';

import { PostTagEditor } from '@/app/posts/components/PostTagEditor';
import { PostModerator } from '@/app/posts/components/PostModerator';

export default function PostContent({ postData, postId }) {
  // Konvertieren der Tags in das richtige Format
  const tagNames = Array.isArray(postData.tags) 
    ? postData.tags.map(tag => typeof tag === 'string' ? tag : tag.name)
    : [];

  return (
    <>
      {/* Post-Inhalt */}
      <h1 className="text-2xl font-bold">{postData.title}</h1>
      
      {/* Bild */}
      <div className="my-4">
        <img 
          src={postData.imageUrl} 
          alt={postData.title} 
          className="max-w-full h-auto rounded-lg"
        />
      </div>
      
      {/* PostModerator-Komponente */}
      <PostModerator postId={postId} />
      
      {/* PostTagEditor-Komponente */}
      <PostTagEditor postId={postId} initialTags={tagNames} />
      
      {/* Weitere Post-Inhalte */}
    </>
  );
} 