import User from '../../models/User';
import Post from '../../models/Post';
import Tag from '../../models/Tag';
import { CreateIndexesOptions } from 'mongodb';

interface IndexInfo {
  name: string;
  fields: { [key: string]: 1 | -1 };
  options: CreateIndexesOptions;
}

const USER_INDEXES: IndexInfo[] = [
  {
    name: 'email_1',
    fields: { email: 1 },
    options: { unique: true, sparse: true } // sparse erlaubt null/undefined Werte
  },
  {
    name: 'username_1',
    fields: { username: 1 },
    options: { unique: true }
  },
  {
    name: 'bio_1_1',
    fields: { bio: 1 },
    options: { sparse: true }
  },
  {
    name: 'favs_1_1',
    fields: { favorites: 1 },
    options: { sparse: true }
  },
  {
    name: 'likes_1_1',
    fields: { likes: 1 },
    options: { sparse: true }
  },
  {
    name: 'role_1',
    fields: { role: 1 },
    options: { }
  },
  {
    name: 'comments_1',
    fields: { comments: 1 },
    options: { sparse: true }
  },
  {
    name: 'tags_1',
    fields: { tags: 1 },
    options: { sparse: true }
  },
  {
    name: 'isPremium_1',
    fields: { isPremium: 1 },
    options: { }
  },
  {
    name: 'isAdmin_1',
    fields: { isAdmin: 1 },
    options: { }
  },
  {
    name: 'isModerator_1',
    fields: { isModerator: 1 },
    options: { }
  }
];

const POST_INDEXES: IndexInfo[] = [
  {
    name: 'id_1',
    fields: { id: 1 },
    options: { unique: true }
  },
  {
    name: 'post_author_1',
    fields: { author: 1 },
    options: { sparse: true }
  },
  {
    name: 'post_contentRating_1',
    fields: { contentRating: 1 },
    options: { }
  },
  {
    name: 'post_tags_1',
    fields: { tags: 1 },
    options: { }
  },
  {
    name: 'post_createdAt_-1',
    fields: { createdAt: -1 },
    options: { }
  }
];

const TAG_INDEXES: IndexInfo[] = [
  {
    name: 'tag_id_1',
    fields: { id: 1 },
    options: { unique: true }
  },
  {
    name: 'tag_name_1',
    fields: { name: 1 },
    options: { unique: true }
  },
  {
    name: 'tag_type_1',
    fields: { type: 1 },
    options: { }
  },
  {
    name: 'tag_postsCount_-1',
    fields: { postsCount: -1 },
    options: { }
  },
  {
    name: 'tag_newPostsToday_-1',
    fields: { newPostsToday: -1 },
    options: { }
  },
  {
    name: 'tag_createdAt_-1',
    fields: { createdAt: -1 },
    options: { }
  }
];

export async function ensureIndexes() {
  try {
    console.log('Checking database indexes...');
    
    // Ensure User indexes
    await ensureCollectionIndexes(User, USER_INDEXES);
    
    // Ensure Post indexes
    await ensureCollectionIndexes(Post, POST_INDEXES);
    
    // Ensure Tag indexes
    await ensureCollectionIndexes(Tag, TAG_INDEXES);

    console.log('Database indexes verified successfully');
  } catch (error) {
    console.error('Error ensuring indexes:', error);
    throw error;
  }
}

async function ensureCollectionIndexes(model: any, requiredIndexes: IndexInfo[]) {
  const collection = model.collection;
  const collectionName = collection.collectionName;
  
  console.log(`Checking indexes for ${collectionName}...`);
  
  // Get existing indexes
  const existingIndexes = await collection.listIndexes().toArray();
  const existingIndexNames = existingIndexes.map(index => index.name);
  
  // Create a map of field keys to existing indexes
  const existingFieldsMap = new Map();
  existingIndexes.forEach(index => {
    const fieldKey = JSON.stringify(Object.keys(index.key).sort());
    existingFieldsMap.set(fieldKey, index.name);
  });

  // Check and create missing indexes
  for (const index of requiredIndexes) {
    // Get a normalized representation of the fields in this index
    const fieldKey = JSON.stringify(Object.keys(index.fields).sort());
    
    // Check if an index on the same fields already exists, regardless of name
    const existingIndexName = existingFieldsMap.get(fieldKey);
    
    if (!existingIndexName) {
      // No index exists for these fields, create it
      console.log(`Creating missing index: ${index.name} for ${collectionName}`);
      try {
        await collection.createIndex(
          index.fields,
          { 
            name: index.name,
            ...index.options 
          } as CreateIndexesOptions
        );
      } catch (err) {
        console.warn(`Warning: Failed to create index ${index.name} for ${collectionName}:`, err);
        // Continue with other indexes rather than failing completely
      }
    } else if (existingIndexName !== index.name) {
      // Index exists but with a different name - log but don't try to change it
      console.log(`Index for fields ${fieldKey} already exists with name ${existingIndexName} (wanted ${index.name})`);
    }
  }
  
  console.log(`Indexes for ${collectionName} verified`);
}
