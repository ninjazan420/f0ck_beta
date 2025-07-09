# API Documentation

This document outlines the available API endpoints in the f0ck.org platform.

## Base URL

All API endpoints are relative to the base URL:

- Development: `http://localhost:3000/api`
- Production: `https://f0ck.org/api`

## Authentication

Many endpoints require authentication using NextAuth.js. Where required, include authentication headers.

## Error Handling

API responses follow a standard format:

- Success: JSON object with requested data
- Error: JSON object with `error` field containing error message and appropriate HTTP status code

## Endpoints

### Authentication

#### Register a new user

```
POST /auth/register
```

**Request Body**:
```json
{
  "username": "string", // 3-16 characters, alphanumeric, _ and -
  "email": "string", // optional
  "password": "string" // min 8 chars, upper+lower+number
}
```

**Response**: User details with ID

#### User Information

```
GET /auth/user
```

**Response**: Current user's information

### Posts

#### Get Posts

```
GET /posts
```

**Query Parameters**:
- `offset`: Number (default: 0)
- `limit`: Number (default: 28)
- `search`: String
- `uploader`: String
- `commenter`: String
- `minLikes`: Number
- `dateFrom`: Date string
- `dateTo`: Date string
- `sortBy`: 'newest' | 'oldest' | 'most_liked' | 'most_commented'
- `contentRating`: Array of 'safe', 'sketchy', 'unsafe'
- `tag`: Array of tag names

**Response**: Paginated list of posts with metadata

#### Get Single Post

```
GET /posts/{id}
```

**Response**: Complete post details including author and tags

### Comments

#### Get Comments

```
GET /comments
```

**Query Parameters**:
- `postId`: String
- `page`: Number (default: 1)
- `limit`: Number (default: 10)
- `status`: 'approved' | 'pending' | 'all' (default: 'approved')

**Response**: Paginated list of comments

#### Create Comment

```
POST /comments
```

**Request Body**:
```json
{
  "content": "string",
  "postId": "string", // Either postId or replyTo must be provided
  "replyTo": "string", // Optional, ID of parent comment
  "isAnonymous": boolean // Optional
}
```

**Response**: Created comment details

#### Update Comment

```
PATCH /comments/{id}
```

**Request Body**:
```json
{
  "content": "string"
}
```

**Response**: Updated comment details

#### Delete Comment

```
DELETE /comments/{id}
```

**Response**: Success confirmation

### Uploads

#### Upload Media

```
POST /upload
```

**Form Data**:
- `file`: File object(s)
- `imageUrl`: String (URL to download from, alternative to file upload)
- `tempFilePath`: String (path to temporary file, if using clipboard)
- `rating`: 'safe' | 'sketchy' | 'unsafe'
- `tags`: JSON string of tag array

**Response**: Uploaded file details including URLs

### Tags

#### Get Tags

```
GET /tags
```

**Query Parameters**:
- `search`: String
- `limit`: Number (default: 20)
- `page`: Number (default: 1)
- `sortBy`: 'newest' | 'alphabetical' | 'trending' | 'most_used'

**Response**: Paginated list of tags

#### Create Tag

```
POST /tags
```

**Request Body**:
```json
{
  "name": "string",
  "aliases": ["string"]
}
```

**Response**: Created tag details

#### Get Single Tag

```
GET /tags/{id}
```

**Response**: Complete tag details

#### Update Tag

```
PUT /tags/{id}
```

**Request Body**:
```json
{
  "type": "string",
  "aliases": ["string"]
}
```

**Response**: Updated tag details

#### Delete Tag

```
DELETE /tags/{id}
```

**Response**: Success confirmation

### User Activities

#### Get User Activity

```
GET /user/activity
```

**Response**: Current user's recent activities

#### Get User Activity by Username

```
GET /users/{username}/activity
```

**Response**: Specified user's recent activities

### Moderation

#### Perform Moderation Action

```
POST /moderation/actions
```

**Request Body**:
```json
{
  "action": "delete" | "ban" | "unban" | "approve" | "reject",
  "targetType": "user" | "comment" | "post",
  "targetId": "string",
  "reason": "string",
  "duration": number // Optional, for temporary bans
}
```

**Response**: Action confirmation

#### Get Moderation Activity

```
GET /moderation/activity
```

**Query Parameters**:
- `page`: Number
- `limit`: Number
- `type`: String
- `action`: String
- `moderator`: String

**Response**: Paginated list of moderation activities

#### Get Moderation Stats

```
GET /moderation/stats
```

**Response**: Moderation-related statistics

### Notifications

#### Get Notifications

```
GET /notifications
```

**Query Parameters**:
- `unread`: Boolean (default: false) - Filter for unread notifications only
- `page`: Number (default: 1)
- `limit`: Number (default: 20)

**Response**: Paginated list of notifications with post details

```json
{
  "notifications": [
    {
      "id": "string",
      "type": "comment" | "reply" | "like" | "dislike" | "favorite" | "mention" | "system",
      "message": "string",
      "isRead": boolean,
      "createdAt": "date",
      "postId": "string",
      "postThumbnail": "string",
      "postTitle": "string",
      "fromUser": {
        "username": "string",
        "avatar": "string"
      }
    }
  ],
  "totalCount": number,
  "unreadCount": number
}
```

#### Mark Notification as Read

```
PUT /notifications/{id}/read
```

**Response**: Success confirmation

#### Mark All Notifications as Read

```
PUT /notifications/mark-all-read
```

**Response**: Success confirmation

#### Clear All Notifications

```
DELETE /notifications/clear-all
```

**Response**: Success confirmation

### Post Interactions

#### Unified Post Interactions

```
POST /posts/{id}/interactions
```

**Request Body**:
```json
{
  "action": "like" | "dislike" | "favorite" | "pin" | "vote",
  "value": boolean | number // For like/dislike/favorite: boolean, for vote: number
}
```

**Response**: Updated interaction counts and user interaction status

```json
{
  "success": true,
  "interactions": {
    "likes": number,
    "dislikes": number,
    "favorites": number,
    "userLiked": boolean,
    "userDisliked": boolean,
    "userFavorited": boolean
  }
}
```

### Enhanced Moderation

#### Get Moderation Statistics

```
GET /moderation/stats
```

**Response**: Comprehensive moderation statistics

```json
{
  "pendingComments": number,
  "reportedPosts": number,
  "activeUsers": number,
  "reportedComments": number,
  "totalModerationActions": number,
  "recentActions": [
    {
      "action": "string",
      "targetType": "string",
      "moderator": "string",
      "timestamp": "date"
    }
  ]
}
```

#### Enhanced Moderation Actions

```
POST /moderation/actions
```

**Request Body**:
```json
{
  "action": "delete" | "ban" | "unban" | "approve" | "reject" | "feature" | "unfeature",
  "targetType": "user" | "comment" | "post" | "tag",
  "targetId": "string",
  "reason": "string",
  "duration": number, // Optional, for temporary bans (in hours)
  "notify": boolean // Whether to send notification to affected user
}
```

**Response**: Action confirmation with logging details

#### Get Reported Comments

```
GET /moderation/reported-comments
```

**Query Parameters**:
- `page`: Number (default: 1)
- `limit`: Number (default: 20)
- `status`: "pending" | "resolved" | "all" (default: "pending")

**Response**: Paginated list of reported comments with context

#### Feature/Unfeature Posts

```
POST /moderation/feature
```

**Request Body**:
```json
{
  "postId": "string",
  "featured": boolean
}
```

**Response**: Success confirmation

#### Tag Moderation

```
GET /moderation/tags
```

**Query Parameters**:
- `page`: Number (default: 1)
- `limit`: Number (default: 50)
- `needsReview": Boolean (default: false)

**Response**: Paginated list of tags with moderation status

### Premium Features

#### Get Premium Status

```
GET /user/premium
```

**Response**: Current user's premium status and features

```json
{
  "isPremium": boolean,
  "premiumUntil": "date",
  "features": {
    "uploadLimit": number,
    "originalQuality": boolean,
    "adFree": boolean,
    "enhancedNotifications": boolean
  }
}
```

### Other Endpoints

#### Get Site Statistics

```
GET /stats
```

**Response**: Site-wide statistics including user roles and premium metrics

#### Image Operations

```
GET /download-image?url={imageUrl}
```

**Response**: Downloaded image

```
GET /download-temp-image?url={imageUrl}
```

**Response**: Downloaded image metadata with temporary path

#### Admin Updates

```
POST /admin/update
```

**Request Body**:
```json
{
  "type": "user_role" | "system_setting",
  "data": object
}
```

**Response**: Update confirmation (Admin only)