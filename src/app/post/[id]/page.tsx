import { Footer } from "@/components/Footer";
import { PostDetails } from "../../posts/components/PostDetails";
import { PostNavigation } from "../../posts/components/PostNavigation";
import { Metadata } from 'next';
import { siteConfig } from '../../metadata';
import dbConnect from '@/lib/db/mongodb';
import Post from '@/models/Post';
import Tag from '@/models/Tag';
import Comment from '@/models/Comment';
import { PostTagEditor } from '@/app/posts/components/PostTagEditor';
import { PostModerator } from '@/app/posts/components/PostModerator';
import { Suspense } from 'react';
import PostContent from './PostContent';

// Mock function to fetch post data (replace with your actual data fetching)
async function getPost(id: string) {
  // Simulate API call - replace with real API call
  return {
    id,
    title: "Amazing Artwork #1",
    description: "This is a beautiful piece of art that I found.",
    imageUrl: "https://picsum.photos/1200/800",
    uploader: { name: "User1" },
    contentRating: "safe",
  };
}

// Hilfsfunktion zum Bereinigen von Titeln für SEO
function sanitizeTitle(title: string): string {
  // Entferne Dateiendungen
  const withoutExtension = title.replace(/\.(jpe?g|png|gif|webp|bmp|mp4|mov|avi)$/i, '');
  
  // Ersetze Unterstriche und Bindestriche durch Leerzeichen
  const withSpaces = withoutExtension.replace(/[_-]+/g, ' ');
  
  // Entferne übermäßige Sonderzeichen und formatiere den Titel für SEO
  const cleaned = withSpaces
    .replace(/[^\w\s\-.,!?:]/g, '') // Entferne unerwünschte Sonderzeichen
    .replace(/\s+/g, ' ')           // Vereinheitliche Leerzeichen
    .trim();
  
  // Erste Buchstaben großschreiben für bessere Lesbarkeit
  const formattedTitle = cleaned
    .split(' ')
    .map(word => {
      if (word.length <= 2) return word; // Kurze Wörter unverändert lassen
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
  
  return formattedTitle || title; // Fallback auf Originaltitel wenn alles entfernt wurde
}

// Hilfsfunktion zur Erstellung einer Tag-Beschreibung
function createTagDescription(tags: Array<{name: string, type: string}>, maxTags = 5): string {
  if (!tags || tags.length === 0) return '';
  
  // Sortiere Tags nach Typ, wobei 'character' und 'copyright' priorisiert werden
  const sortedTags = [...tags].sort((a, b) => {
    const typeOrder: Record<string, number> = {
      'character': 1,
      'copyright': 2,
      'artist': 3,
      'general': 4,
      'meta': 5
    };
    return (typeOrder[a.type] || 999) - (typeOrder[b.type] || 999);
  });
  
  // Nimm die ersten maxTags Tags
  const selectedTags = sortedTags.slice(0, maxTags);
  
  // Erstelle die Beschreibung
  return selectedTags.map(tag => `#${tag.name}`).join(' ');
}

async function getPostData(id: string) {
  try {
    await dbConnect();
    
    // Versuche die numerische ID zu parsen
    const numericId = parseInt(id, 10);
    
    // Suche nach Post mit numerischer ID oder String-ID
    const query = isNaN(numericId) 
      ? { id: id } 
      : { $or: [{ id: id }, { numericId: numericId }] };
    
    const post = await Post.findOne(query).populate('author', 'username avatar bio premium role');
    
    if (!post) {
      return null;
    }
    
    // Tag-Informationen anreichern, falls noch nicht geschehen
    let tagData = [];
    if (post.tags && Array.isArray(post.tags)) {
      if (typeof post.tags[0] === 'string') {
        // Tags sind nur Strings, wir müssen die Tag-Informationen laden
        for (const tagName of post.tags) {
          const tag = await Tag.findOne({ 
            $or: [
              { name: tagName },
              { id: tagName }
            ] 
          });
          
          if (tag) {
            tagData.push({
              id: tag.id || tag._id?.toString() || tagName,
              name: tag.name,
              type: tag.type || 'general',
              count: tag.postsCount || 0
            });
          } else {
            // Fallback
            tagData.push({
              id: tagName,
              name: tagName,
              type: 'general',
              count: 0
            });
          }
        }
      } else {
        // Tags sind bereits komplexe Objekte
        tagData = post.tags;
      }
    }
    
    return {
      id: post.id || post._id.toString(),
      numericId: post.numericId || parseInt(post.id, 10) || null,
      title: post.title || 'Untitled',
      description: post.description || '',
      imageUrl: post.imageUrl || '',
      thumbnailUrl: post.thumbnailUrl || post.imageUrl || '',
      contentRating: post.contentRating || 'safe',
      author: post.author ? {
        username: post.author.username || 'anonymous',
        avatar: post.author.avatar,
        bio: post.author.bio || '',
        premium: !!post.author.premium,
        role: post.author.role || 'user'
      } : null,
      tags: tagData,
      createdAt: post.createdAt || new Date()
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

// Diese Funktion zur Prüfung auf Kommentar-Fragmente hinzufügen
async function checkForCommentFragment(id: string, url: string): Promise<{ commentData: any; commentFragment: string | null }> {
  // Überprüfe, ob die URL ein Kommentar-Fragment enthält
  const match = url.match(/#comment-([a-f0-9]+)/i);
  const commentFragment = match ? match[0] : null;
  const commentId = match ? match[1] : null;
  
  if (!commentId) {
    return { commentData: null, commentFragment };
  }
  
  try {
    // Lade den Kommentar aus der Datenbank
    await dbConnect();
    const comment = await Comment.findById(commentId)
      .populate('author', 'username avatar bio premium role');
    
    if (!comment || comment.post.toString() !== id) {
      return { commentData: null, commentFragment };
    }
    
    return {
      commentData: {
        id: comment._id.toString(),
        content: comment.content,
        author: comment.author ? {
          username: comment.author.username || 'anonymous',
          avatar: comment.author.avatar
        } : { username: 'anonymous', avatar: null },
        createdAt: comment.createdAt
      },
      commentFragment
    };
  } catch (error) {
    console.error('Error fetching comment:', error);
    return { commentData: null, commentFragment };
  }
}

// Funktion zum Überprüfen, ob ein Post existiert
async function checkPostExists(id: number | string): Promise<boolean> {
  try {
    await dbConnect();
    
    // Versuche die numerische ID zu parsen, falls es ein String ist
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    // Suche nach Post mit numerischer ID oder String-ID
    const query = isNaN(numericId) 
      ? { id: id } 
      : { $or: [{ id: id.toString() }, { numericId: numericId }] };
    
    const exists = await Post.exists(query);
    return !!exists;
  } catch (error) {
    console.error('Error checking if post exists:', error);
    return false;
  }
}

// Funktion zum Finden des nächsten und vorherigen Posts
async function getAdjacentPosts(currentId: string) {
  try {
    await dbConnect();
    
    // Versuche die numerische ID zu parsen
    const numericId = parseInt(currentId, 10);
    
    // Bestimme, ob wir mit einer numerischen ID oder String-ID arbeiten
    let currentPost;
    
    if (!isNaN(numericId)) {
      currentPost = await Post.findOne({ 
        $or: [{ id: currentId }, { numericId: numericId }] 
      });
    } else {
      currentPost = await Post.findOne({ id: currentId });
    }
    
    if (!currentPost) {
      return { next: null, previous: null };
    }
    
    // Verwende die numericId des Posts, falls vorhanden, sonst die _id für Sortierung
    const postIdentifier = currentPost.numericId || currentPost._id;
    
    // Suche nach dem nächsten Post (höhere ID)
    let nextQuery = {};
    if (currentPost.numericId) {
      nextQuery = { numericId: { $gt: currentPost.numericId } };
    } else {
      nextQuery = { _id: { $gt: currentPost._id } };
    }
    
    const nextPost = await Post.findOne(nextQuery)
      .sort(currentPost.numericId ? { numericId: 1 } : { _id: 1 })
      .select('id numericId');
    
    // Suche nach dem vorherigen Post (niedrigere ID)
    let prevQuery = {};
    if (currentPost.numericId) {
      prevQuery = { numericId: { $lt: currentPost.numericId } };
    } else {
      prevQuery = { _id: { $lt: currentPost._id } };
    }
    
    const previousPost = await Post.findOne(prevQuery)
      .sort(currentPost.numericId ? { numericId: -1 } : { _id: -1 })
      .select('id numericId');
    
    return {
      next: nextPost ? {
        id: nextPost.id || nextPost._id.toString(),
        numericId: nextPost.numericId
      } : null,
      previous: previousPost ? {
        id: previousPost.id || previousPost._id.toString(),
        numericId: previousPost.numericId
      } : null
    };
  } catch (error) {
    console.error('Error finding adjacent posts:', error);
    return { next: null, previous: null };
  }
}

// Hilfsfunktion zum Überprüfen, ob die URL localhost ist
function getAbsoluteImageUrl(relativeUrl: string): string {
  // Wenn die URL bereits absolut ist, gib sie unverändert zurück
  if (relativeUrl.startsWith('http')) {
    return relativeUrl;
  }
  
  // Verwende immer die Produktions-URL für Vorschaubilder, nie localhost
  // Das löst das Problem mit fehlenden Vorschaubildern beim lokalen Entwickeln
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beta.f0ck.org';
  
  // Stelle sicher, dass die URL mit einem Slash beginnt
  const formattedRelativeUrl = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;
  
  return `${baseUrl}${formattedRelativeUrl}`;
}

export async function generateMetadata({ params, searchParams }: { params: { id: string }, searchParams: Record<string, string> }): Promise<Metadata> {
  // params muss zuerst aufgelöst werden
  const resolvedParams = await params;
  const postData = await getPostData(resolvedParams.id);
  
  if (!postData) {
    return {
      title: `Post not found | ${siteConfig.name}`,
      description: `This post could not be found on ${siteConfig.name}`,
    };
  }
  
  // Überprüfe, ob die URL auf einen bestimmten Kommentar zeigt
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const { commentData, commentFragment } = await checkForCommentFragment(postData.id, url);
  
  // Bereinige den Titel für SEO
  const cleanTitle = sanitizeTitle(postData.title);
  
  // Erstelle eine Tag-Liste ohne Rauten
  const tagsList = postData.tags
    .slice(0, 5)
    .map((tag: {name: string}) => tag.name)
    .join(', ');
  
  // Neues Format für die Beschreibung:
  // "View <bildtitel> post by <username> on f0ck.org | <tags ohne raute>"
  let description = `View ${cleanTitle || `Image #${postData.numericId || postData.id}`} post by ${
    postData.author?.username || 'Anonymous'
  } on ${siteConfig.name}`;
  
  // Füge Tags hinzu, wenn vorhanden
  if (tagsList) {
    description = `${description} | ${tagsList}`;
  }
  
  // Wenn ein Kommentar verlinkt ist, füge dessen Inhalt zur Beschreibung hinzu
  if (commentData) {
    const commentPreview = commentData.content.length > 100 
      ? `${commentData.content.substring(0, 97)}...` 
      : commentData.content;
      
    description = `Comment by ${commentData.author.username}: "${commentPreview}" | ${description}`;
  }
  
  // Passe den Titel an, wenn ein Kommentar verlinkt wird
  const title = commentData
    ? `Comment on ${cleanTitle || `Image #${postData.numericId || postData.id}`} | ${siteConfig.name}`
    : (cleanTitle 
      ? `${cleanTitle} | ${siteConfig.name}` 
      : `Image #${postData.numericId || postData.id} | ${siteConfig.name}`);
  
  // Bestimme den Inhaltstyp für OG/Twitter
  const contentType = postData.contentRating === 'unsafe' ? 'mature' : 'image';
  
  // Wichtig: Verwende die absolute URL für Bilder, auch bei lokaler Entwicklung
  const imageUrl = getAbsoluteImageUrl(postData.imageUrl);
  
  // Erstelle die volle URL mit Kommentar-Fragment, falls vorhanden
  const fullUrl = commentFragment
    ? `${process.env.NEXT_PUBLIC_BASE_URL || "https://beta.f0ck.org"}/post/${
        postData.numericId || postData.id
      }${commentFragment}`
    : `${process.env.NEXT_PUBLIC_BASE_URL || "https://beta.f0ck.org"}/post/${
        postData.numericId || postData.id
      }`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: commentData ? 'article.comment' : 'article',
      url: fullUrl,
      images: [
        {
          url: imageUrl,
          alt: cleanTitle || `Image #${postData.numericId || postData.id}`,
          width: 1200,
          height: 630
        }
      ],
      siteName: siteConfig.name,
      tags: postData.tags.slice(0, 8).map((tag: {name: string, type: string}) => tag.name),
      publishedTime: new Date(postData.createdAt).toISOString(),
      // Wenn ein Kommentar verlinkt ist, füge dessen Autor als "author" hinzu
      ...(commentData && {
        author: commentData.author.username
      })
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: commentData 
        ? `@${commentData.author.username}` 
        : (postData.author?.username ? `@${postData.author.username}` : '@f0ck_org')
    },
    // Zusätzliche Metadaten für erweiterte Suchmaschinen-Indexierung
    keywords: postData.tags.map((tag: {name: string, type: string}) => tag.name).join(', '),
    robots: {
      index: postData.contentRating !== 'unsafe',
      follow: true
    }
  };
}

export default async function PostPage({ params }: { params: { id: string } }) {
  // params muss zuerst aufgelöst werden
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  // Hole Informationen über benachbarte Posts für die Navigation
  const adjacentPosts = await getAdjacentPosts(id);
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-4 max-w-6xl flex-grow">
        <PostNavigation 
          currentId={id} 
          nextPostId={adjacentPosts.next?.id || adjacentPosts.next?.numericId?.toString()} 
          previousPostId={adjacentPosts.previous?.id || adjacentPosts.previous?.numericId?.toString()} 
        />
        <div className="mt-6">
          <PostDetails postId={id} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
