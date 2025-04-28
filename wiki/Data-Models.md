# Data Models

This page documents the core data models used in the f0ck.org platform and their relationships.

## User Model

The User model represents registered users in the system.

### Schema

```typescript
{
  email: String, // Optional, unique if provided
  name: String, // Optional
  username: String, // Required, unique
  password: String, // Hashed, required
  bio: String, // Optional, max 140 chars
  avatar: String, // Optional, path to avatar image
  favorites: [ObjectId], // References to Post model
  likes: [ObjectId], // References to Post model
  comments: [ObjectId], // References to Comment model
  tags: [ObjectId], // References to Tag model
  lastSeen: Date,
  role: String, // 'user', 'premium', 'moderator', 'admin', or 'banned'
  uploads: [ObjectId], // References to Post model
  createdAt: Date,
  updatedAt: Date
}
```

### Virtual Fields

- `stats`: Computed object containing counts of uploads, comments, favorites, likes, and tags

## Post Model

The Post model represents media uploads in the system.

### Schema

```typescript
{
  id: Number, // Unique numeric ID, auto-incremented
  title: String, // Required
  description: String, // Optional
  imageUrl: String, // Path to original image
  thumbnailUrl: String, // Path to thumbnail
  author: ObjectId, // Reference to User model, optional for anonymous posts
  contentRating: String, // 'safe', 'sketchy', or 'unsafe'
  tags: [String], // Array of tag names
  meta: {
    width: Number,
    height: Number,
    size: Number,
    format: String,
    source: String // Optional
  },
  stats: {
    views: Number,
    likes: Number,
    dislikes: Number,
    comments: Number,
    favorites: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Behaviors

- Auto-generates numeric ID on creation
- Normalizes tags to lowercase with underscores
- Removes duplicate tags

## Comment Model

The Comment model represents user comments on posts.

### Schema

```typescript
{
  content: String, // Required
  author: ObjectId, // Reference to User model, optional for anonymous
  post: ObjectId, // Reference to Post model
  replyTo: ObjectId, // Optional reference to parent Comment
  status: String, // 'pending', 'approved', or 'rejected'
  reports: [{
    user: ObjectId, // Reference to User model
    reason: String,
    createdAt: Date
  }],
  isHidden: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Virtual Fields

- `reportCount`: Number of reports on the comment

## Tag Model

The Tag model represents content tags used for organization and search.

### Schema

```typescript
{
  id: String, // Unique identifier
  name: String, // Required, unique, lowercase
  postsCount: Number, // Count of posts with this tag
  newPostsToday: Number, // Count of new posts today
  newPostsThisWeek: Number, // Count of new posts this week
  relatedTags: [String], // Related tag references
  aliases: [String], // Alternative names
  createdAt: Date,
  updatedAt: Date
}
```

### Methods

- `updateCounts()`: Updates post counts
- `getPopularTags()`: Static method to get most used tags
- `findOrCreate()`: Static method to find or create a tag by name

## ModLog Model

The ModLog model tracks moderation actions.

### Schema

```typescript
{
  moderator: ObjectId, // Reference to User model
  action: String, // 'delete', 'warn', 'ban', 'unban', 'approve', 'reject'
  targetType: String, // 'comment', 'post', 'user'
  targetId: ObjectId, // Reference to target model
  reason: String,
  metadata: {
    previousState: Mixed, // State before action
    newState: Mixed, // State after action
    duration: Number, // For temporary bans (hours)
    autoTriggered: Boolean // If action was automated
  },
  createdAt: Date
}
```

### Virtual Fields

- `isTemporary`: Boolean indicating if a ban is temporary

## Database Relationships

- **User → Posts**: One-to-many (a user can have many uploads)
- **User → Comments**: One-to-many (a user can have many comments)
- **Post → Comments**: One-to-many (a post can have many comments)
- **Post → Tags**: Many-to-many (posts can have multiple tags)
- **Comment → Comment**: Self-reference for reply threading
- **User → User**: Implicit relationships through moderation actions

## Database Indexing

The application automatically ensures proper indexing on:

- `User`: indexes on username, email, role, and various relationship fields
- `Post`: indexes on id, author, contentRating, tags, and creation date
- `Comment`: indexes on author, post, createdAt, and status
- `Tag`: indexes on name, postsCount, and other sorting fields

These indexes ensure optimal query performance throughout the application. 