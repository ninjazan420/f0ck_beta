# Feature Overview

This document provides a detailed overview of the key features available in the f0ck.org platform.

## Media System

### Anonymous Image Sharing

- **No Account Required**: Upload images without registration
- **Quick Sharing**: Simple upload interface with drag-and-drop
- **Multiple Upload Methods**:
  - Traditional file selection
  - URL import
  - Copy-paste functionality
  - Image grabbing from websites

### Media Processing

- **Automatic Thumbnail Generation**: Creates optimized thumbnails for faster browsing
- **Dimension Handling**: Processes images of various sizes appropriately
- **Format Support**: Handles JPG, PNG, GIF, WebM, MP4, and other common formats
- **Content Rating System**: Allows marking content as Safe, Sketchy, or Unsafe
- **Video Processing**: Full support for video uploads with automatic processing
- **Chunked Uploads**: Large files are split into manageable chunks for reliable uploading

### Upload Feature Details

- **Multiple File Support**: Upload multiple files in one operation
- **URL Download Integration**: Import images from URLs
- **Error Handling**: Robust error recovery during uploads
- **Progress Tracking**: Visual feedback during upload process

## Tag System

### Content Organization

- **Multi-tag Support**: Add up to 10 tags per upload
- **Unified Tag Structure**: Simple, non-hierarchical tagging system
- **Tag Validation**: Ensures consistent formatting of tags
- **Tag Statistics**: Track popularity and usage of tags

### Tag Search and Discovery

- **Tag-Based Filtering**: Find content with specific tags
- **Combined Searches**: Use tags with other search criteria
- **Related Tags**: Discover connected content through tag relationships
- **Popular Tags**: View most-used tags for content discovery

## Comment System

### Real-time Interaction

- **Live Comments**: WebSocket integration for instant updates
- **Thread Notifications**: See new replies in real-time
- **Rich Comment Formatting**: Support for basic formatting

### Media in Comments

- **GIF Integration**: GIPHY API integration for GIF insertion
- **Emoji Support**: Enhanced emoji picker
- **Image References**: Quote and reference images in discussions

### Comment Management

- **Nested Replies**: Threaded conversations for better context
- **Edit Functionality**: Users can edit their own comments
- **Delete Options**: Comment removal with proper permissions
- **Quote System**: Quote previous comments in replies

### Anonymous Commenting

- **No Account Required**: Comment without registration
- **Anonymous Identity**: Distinct anonymous designations
- **Same-session Recognition**: System recognizes same-session anonymous users

## Search System

### Advanced Filtering

- **Multi-criteria Search**: Combine various search parameters
- **User Filtering**: Find content by specific uploaders or commenters
- **Date Range Selection**: Search within specific time periods
- **Rating Filters**: Filter by content rating (Safe/Sketchy/Unsafe)

### Sorting Options

- **Chronological**: Newest or oldest content first
- **Popularity**: Sort by likes or comment count
- **Activity**: Recently commented content

### Visual Search

- **Reverse Image Search**: Find similar images
- **Visual Similarity**: Matches based on image content
- **External Search Integration**: Connect with external reverse image search engines

## User Interface

### Content Browsing

- **Infinite Scroll**: Seamless browsing experience
- **Grid Layout**: Optimized 7x4 image grid
- **Image Preview**: Hover previews of content
- **Keyboard Navigation**: Browse posts using arrow keys

### Responsive Design

- **Mobile Optimization**: Fully responsive on all devices
- **Touch-friendly Controls**: Enhanced controls for touch devices
- **Adaptive Layout**: Adjusts to screen size and orientation

### User Experience

- **Dark/Light Mode**: Theme switching for different preferences
- **Persistent Settings**: User preferences saved in localStorage
- **Performance Optimization**: Fast loading and rendering
- **Accessibility Features**: Improved screen reader support
- **Stay Logged In**: Option to maintain longer login sessions
- **Advanced Notification System**: Comprehensive real-time notifications with management
- **Sharing Features**: Easy content sharing with share banners

## User System

### Optional Accounts

- **Enhanced Features**: Additional capabilities for registered users
- **Profile Customization**: Avatar, bio, and personal settings
- **Activity Tracking**: View personal upload and comment history

### User Profiles

- **Public Profiles**: View other users' activity and contributions
- **Statistics Display**: See engagement metrics for users
- **Content Filtering**: Filter content by specific users

### Role System

- **User Roles**: Regular, Premium, Moderator, Admin, Banned tiers
- **Role Badges**: Visual indicators of user status with premium styling
- **Permission System**: Different capabilities based on role
- **Premium Membership**: Enhanced features and visual distinction
## Moderation System

### Advanced Content Moderation

- **Real-time Moderation Dashboard**: Comprehensive overview with live statistics
- **Comment Moderation**: Review, approve, reject, and delete comments
- **Content Flagging**: Enhanced reporting system for inappropriate content
- **Moderation Queue**: Organized review of flagged content with priority handling
- **Featured Posts**: Ability to highlight important content
- **Pinned Posts**: Pin important posts to the top of listings
- **Advanced Tag Management**: Bulk operations and moderation tools for tags
- **Reported Content Tracking**: Real-time tracking of reported posts and comments

### Enhanced User Management

- **Comprehensive User Controls**: Ban, unban, role changes with automated logging
- **User Restrictions**: Granular ability to limit problematic users
- **Advanced Ban System**: Temporary or permanent account restrictions with reasons
- **Action Logging**: Comprehensive logs of all moderation actions with timestamps
- **Bulk Operations**: Efficient management of multiple users or content items

### Administration Dashboard

- **Real-time Statistics**: Live overview of platform activity and health
- **Moderation Metrics**: Pending comments, reported content, active user monitoring
- **Performance Monitoring**: Track system health and response times
- **User Growth Metrics**: Monitor user registration and activity trends
- **Moderation Workload**: Track moderator activity and efficiency

## Notification System

### Comprehensive Notifications

- **Real-time Delivery**: Instant notifications for all user interactions
- **Notification Types**: Comment, Reply, Like, Dislike, Favorite, Mention, System
- **@Mention System**: Smart username detection with automatic notifications
- **Notification Management**: Mark as read, clear all, granular category settings
- **Live Counter**: Real-time unread notification indicator
- **Quick Preview**: Instant preview of recent notifications in navigation

### Notification Features

- **Granular Settings**: Control notifications per category and type
- **Batch Operations**: Mark all as read or clear all notifications
- **Direct Links**: Navigate directly to related content from notifications
- **Filtering Options**: Enhanced filtering for premium users

## Technical Features

### Enhanced WebSocket Integration

- **Real-time Infrastructure**: Preparation for full WebSocket implementation
- **Comment Polling**: Live comment updates with 10-second intervals
- **Notification Delivery**: Real-time notification system
- **Connection Management**: Efficient socket handling and fallback systems
- **Event Broadcasting**: System for real-time event distribution

### Expanded API System

- **RESTful Endpoints**: Well-structured API for all operations
- **New Endpoints**: Notifications, moderation, enhanced interactions
- **Unified Interactions**: Streamlined API for likes, dislikes, favorites
- **Rate Limiting**: Protection against API abuse
- **Enhanced Error Handling**: Comprehensive error responses and validation
- **Role-based Access**: API endpoints with proper permission checking

### Advanced Security Features

- **Enhanced Authentication**: Role-based authentication with premium support
- **Rate Protection**: Guards against brute force attacks
- **Input Validation**: Thorough validation of all user inputs
- **XSS Protection**: Measures against cross-site scripting
- **CSRF Protection**: Prevention of cross-site request forgery attacks
- **Storage Quota Management**: User-specific upload limits and tracking