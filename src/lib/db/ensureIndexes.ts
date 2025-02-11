import User from '../../models/User';
import { CreateIndexesOptions } from 'mongodb';

interface IndexInfo {
  name: string;
  fields: { [key: string]: 1 | -1 };
  options: CreateIndexesOptions;
}

const REQUIRED_INDEXES: IndexInfo[] = [
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

export async function ensureIndexes() {
  try {
    console.log('Checking database indexes...');
    
    // Hole existierende Indizes
    const collection = User.collection;
    const existingIndexes = await collection.listIndexes().toArray();
    const existingIndexNames = existingIndexes.map(index => index.name);

    // Prüfe und erstelle fehlende Indizes
    for (const index of REQUIRED_INDEXES) {
      if (!existingIndexNames.includes(index.name)) {
        console.log(`Creating missing index: ${index.name}`);
        await collection.createIndex(
          index.fields,
          { 
            name: index.name,
            ...index.options 
          } as CreateIndexesOptions
        );
      }
    }

    console.log('Database indexes verified successfully');
  } catch (error) {
    console.error('Error ensuring indexes:', error);
    throw error;
  }
}
