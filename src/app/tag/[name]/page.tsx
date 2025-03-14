import { Metadata } from 'next';
import { siteConfig } from '../../metadata';
import dbConnect from '@/lib/db/mongodb';
import Tag from '@/models/Tag';
import Post from '@/models/Post';

async function getTagData(name: string) {
  try {
    await dbConnect();
    
    // Finde den Tag in der Datenbank
    const tag = await Tag.findOne({
      $or: [
        { name: name },
        { id: name }
      ]
    });
    
    if (!tag) {
      return null;
    }
    
    // Finde einen repräsentativen Post für diesen Tag
    const samplePost = await Post.findOne({ 
      tags: { $in: [tag.name, tag.id] },
      contentRating: { $ne: 'unsafe' }  // Bevorzuge sichere Inhalte für Vorschaubilder
    }).sort({ createdAt: -1 }).limit(1);
    
    return {
      id: tag.id || tag._id?.toString(),
      name: tag.name,
      description: tag.description || '',
      type: tag.type || 'general',
      count: tag.postsCount || await Post.countDocuments({ tags: { $in: [tag.name, tag.id] } }),
      samplePostImage: samplePost?.imageUrl || samplePost?.thumbnailUrl || null
    };
  } catch (error) {
    console.error('Error fetching tag:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { name: string } }): Promise<Metadata> {
  const tagData = await getTagData(params.name);
  
  if (!tagData) {
    return {
      title: `Tag not found | ${siteConfig.name}`,
      description: `This tag could not be found on ${siteConfig.name}`
    };
  }
  
  // Formatiere den Tag-Namen für einen besseren Titel (erste Buchstaben groß)
  const formattedName = tagData.name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Erstelle einen Titel basierend auf Tag-Typ
  let typeDescription = '';
  switch (tagData.type) {
    case 'character':
      typeDescription = 'Character';
      break;
    case 'copyright':
      typeDescription = 'Series';
      break;
    case 'artist':
      typeDescription = 'Artist';
      break;
    case 'meta':
      typeDescription = 'Meta tag';
      break;
    default:
      typeDescription = 'Tag';
  }
  
  const title = `${formattedName} ${typeDescription} | ${tagData.count} posts | ${siteConfig.name}`;
  
  // Erstelle eine Beschreibung basierend auf verfügbaren Informationen
  let description = tagData.description
    ? `${tagData.description} | ${tagData.count} posts tagged with ${tagData.name}`
    : `Browse ${tagData.count} posts tagged with ${tagData.name} on ${siteConfig.name}`;
  
  // Wähle ein Bild für die Vorschau - entweder ein Beispielbild oder ein Fallback
  const imageUrl = tagData.samplePostImage || 
    `${process.env.NEXT_PUBLIC_BASE_URL || 'https://beta.f0ck.org'}/api/tag-image/${encodeURIComponent(tagData.name)}`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://beta.f0ck.org'}/tag/${tagData.name}`,
      images: tagData.samplePostImage ? [
        {
          url: imageUrl,
          alt: `Posts tagged with ${tagData.name}`,
          width: 1200,
          height: 630
        }
      ] : undefined,
      siteName: siteConfig.name,
    },
    twitter: {
      card: tagData.samplePostImage ? 'summary_large_image' : 'summary',
      title,
      description,
      images: tagData.samplePostImage ? [imageUrl] : undefined,
    },
    keywords: `${tagData.name}, ${tagData.type}, images, f0ck, tags`,
  };
}

// Die eigentliche Seiten-Komponente bleibt unverändert
export default function TagPage({ params }: { params: { name: string } }) {
  // Deine bestehende Komponente hier...
  return (
    <div>
      {/* Tag-Seiten-Inhalte */}
    </div>
  );
} 