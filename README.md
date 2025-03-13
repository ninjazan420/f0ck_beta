# f0ck.org Beta v2.3.0

> ⚠️ **Development Notice**: This project is currently under active development. A public live version is online, but many functions are still being improved.

Modern, next-generation anonymous imageboard platform built with Next.js 14 and TailwindCSS. Upload and share images freely - accounts optional!

![grafik](https://github.com/user-attachments/assets/b35c9f71-d950-4b09-9943-f228cfbd8889)

![grafik](https://github.com/user-attachments/assets/a5c4631b-90c7-497e-81e3-4c18cb0e96b5)

![grafik](https://github.com/user-attachments/assets/e16a991f-6230-4819-a7f4-b38884fad9a2)

## 📋 Table of Contents

- [f0ck.org Beta v2.3.0](#f0ckorg-beta-v230)
  - [📋 Table of Contents](#-table-of-contents)
  - [⚡ Features](#-features)
  - [🚀 Installation](#-installation)
    - [Development Setup](#development-setup)
    - [Production Setup](#production-setup)
    - [Environment Setup](#environment-setup)
  - [🛠️ Tech Stack](#️-tech-stack)
  - [🔥 Latest Updates](#-latest-updates)
    - [Beta v2.3.0 (Current)](#beta-v230-current)
      - [🔧 Enhanced Moderation](#-enhanced-moderation)
      - [🏷️ Tag Management](#️-tag-management)
      - [🐛 Bug Fixes](#-bug-fixes)
    - [Beta v2.2.0](#beta-v220)
      - [🔧 Technical Improvements](#-technical-improvements)
    - [Beta v2.0.0](#beta-v200)
      - [🚀 State of the Art Beta Website](#-state-of-the-art-beta-website)
      - [🖼️ Comprehensive Media System](#️-comprehensive-media-system)
      - [🏷️ Complete Tag System](#️-complete-tag-system)
      - [💬 Enhanced Comment Features](#-enhanced-comment-features)
      - [🔍 Advanced Search Features](#-advanced-search-features)
    - [Older Versions (click to expand)](#older-versions-click-to-expand)
  - [🌐 Links \& Support](#-links--support)
  - [📜 License](#-license)

## ⚡ Features

- Anonymous Image Sharing
  - No account required for uploads
  - Quick and easy image posting
  - Automatic thumbnail generation
  - Support for large image files
  - Intelligent image resizing
  - Optional user accounts for enhanced features
- Multi-media support
  - Image and video uploads
  - GIF support with GIPHY integration
  - Embedded media preview
  - Advanced thumbnails with hover preview
- Real-time comment system
  - Rich text formatting
  - GIF and emoji support
  - Reply threading
  - WebSocket live updates
  - Automatic spam detection
  - Role-based moderation
  - Report & live moderation system
- User profiles with customization (Optional)
  - Activity feed
  - Role badges (Admin, Mod, Premium)
  - Stats overview
- Premium features
  - Custom nicknames
  - Ad-free experience
  - Exclusive themes
  - Premium badges
- Modern UI/UX
  - Dark/Light mode
  - Infinite scroll
  - 7x4 grid layout with intelligent image adjustment
- Security
  - Integrated security system
  - Spam protection
  - Role-based access control
  - Report handling

## 🚀 Installation

### Development Setup

```bash
# Clone the repository
git clone https://github.com/ninjazan420/f0ck_beta.git

# Navigate to project directory
cd f0ck_beta

# Install dependencies
npm install

# Start development server
npm run dev
```

The development server will be available at:

- **URL**: `http://localhost:3000`
- **API**: `http://localhost:3000/api`
- **WebSocket**: `ws://localhost:3000` (automatically configured)

### Production Setup

```bash
# Clone the repository
git clone https://github.com/ninjazan420/f0ck_beta.git

# Navigate to project directory
cd f0ck_beta

# Install dependencies
npm install

# Build and start the production server
npm run prod
```

The production server will be available at:

- **URL**: `http://localhost:3000`
- **API**: `http://localhost:3000/api`
- **WebSocket**: `ws://localhost:3000` (automatically configured)

### Environment Setup

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=your_mongodb_uri
GIPHY_API_KEY=your_giphy_api_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **Typography**: Geist Font
- **Architecture**: React Server Components
- **Real-time**: WebSocket Integration
- **Deployment**: Vercel Edge Runtime
- **Database**: MongoDB Atlas
- **Media**: GIPHY API Integration

## 🔥 Latest Updates

### Beta v2.3.0 (Current)

#### 🔧 Enhanced Moderation

- **Redesigned Moderation Dashboard**:
  - New tab-based navigation system for improved workflow
  - Consolidated moderation tools in a single, intuitive interface
  - Improved activity logging with detailed action information
  - Better visualization of moderation activities

#### 🏷️ Tag Management

- **Tag Moderation**:
  - New moderation routes for tag management
  - Delete functionality for problematic tags
- **User Tag Editing**:
  - Added tag editing capabilities for regular users
  - Improved tag validation and error messaging

#### 🐛 Bug Fixes

- Fixed race condition issues in file uploads
- Corrected tag and NSFW filtering on the posts page
- Enhanced security through various updates
- Resolved avatar upload problems
- Fixed various path issues and security vulnerabilities

### Beta v2.2.0

#### 🔧 Technical Improvements

- **API Optimizations**:
  - Fixed params.id usage with await: `const id = Number(await params.id)`
  - Resolved "params should be awaited before using its properties" error
  - Removed anonymous links from documentation
  - Extensive security fixes and API optimizations

### Beta v2.0.0

#### 🚀 State of the Art Beta Website

This version marks an important milestone for the f0ck.org project, consolidating all improvements and features from previous beta versions. Version 2.0.0 represents the current state of the art of the beta website with a stable foundation for future development.

#### 🖼️ Comprehensive Media System

- **Fully functional upload system**:
  - Support for anonymous uploads without account requirement
  - Optimized image and video processing with automatic thumbnail generation
  - Advanced file type validation and error handling
  - Copy & Paste functionality and direct uploading via image grabbing
  - Reliable processing of thumbnails and original images

#### 🏷️ Complete Tag System

- **Organize and discover content with tags**:
  - Up to 10 tags per upload for better findability
  - Simplified tag structure without category distinctions
  - Powerful tag search with combinable search criteria
  - Intelligent tag validation for consistent taxonomy

#### 💬 Enhanced Comment Features

- **Comprehensive comment system**:
  - Live comments with WebSocket integration
  - GIF and emoji support through GIPHY integration
  - Extended functions: edit, delete, quote
  - Reply threading for nested discussions
  - Support for anonymous commenting

#### 🔍 Advanced Search Features

- **Advanced filter and search options**:
  - Extensive filtering options (uploader, commenter, likes, date)
  - Flexible sorting options (newest, oldest, most likes, most comments)
  - Reverse Image Search for similar image search
  - Support for registration period filter
  - Intelligent pagination with page navigator

### Older Versions (click to expand)

<details>
<summary>Beta v1.7.0</summary>

#### 👤 Improved User Interface

- **New avatar functionality**: Implementation of a redesigned account card with enhanced avatar features
- **Optimized post navigation**: 
  - Support for left/right arrows and A/D keys to browse through posts
  - Fixed post navigator to consider only the current state

#### 🚀 New Features

- **Enhanced upload capabilities**: 
  - Implemented Copy & Paste functionality
  - Added direct uploading via image grabbing
- **Technical improvements**:
  - Fixed UUID linter error by adding uuid.d.ts

#### 🛠️ Bug Fixes

- **Fixed filters and search**:
  - Restored registration period filter
  - Fixed Yandex in reverse image search
- **Improved image display**:
  - Fixed thumbnail and image URLs
  - Fixed "Sketchy"/"Unsafe" posts not loading on first visit
- **Optimized feeds**:
  - Fixed activity feed on /users/id and /account that sometimes didn't load
</details>

<details>
<summary>Beta v1.6.0</summary>

#### 🏷️ Tag System Fully Implemented

- **Organize and discover content with tags**: The complete tag system is now live, allowing users to add up to 10 tags per upload
- **Simplified tag structure**: Unified tag system without category distinctions for more intuitive tagging
- **Powerful tag search**: Find exactly what you're looking for by filtering posts with tags combined with other search criteria
- **Enhanced user experience** with clear error messaging and improved tag validation
- **Performance optimizations** for tag-based searches and filtering

#### 🔍 Key Functional Improvements

- **Fixed Reverse Image Search**: The similar image search feature now works reliably
- **Improved content filtering**: Optimized behavior for Safe/Sketchy/Unsafe content filters
- **Streamlined anonymous posts**: Removed misleading "Anonymous" links in comments and uploads

#### 🎨 UI Refinements

- Consistent avatar styling in post details view
- Enhanced visual hierarchy for better usability
</details>

<details>
<summary>Beta v1.5.0</summary>

#### 🔍 Search Improvements

- Advanced post filtering with comprehensive search options now live
- Support for filtering by uploader, commenter, likes, and date
- Implemented sorting options (newest, oldest, most likes, most comments)
- Pagination with page navigator adjusted to real pages

#### 📱 Mobile Optimization

- Postgrid optimized for mobile devices
- Improved responsive layout for various screen sizes
- Adjustments for better touch interaction

#### 🚀 Performance Enhancements

- Infinite scroll implemented for smoother user experience
- User settings stored in localStorage for persistent filter preferences
- Optimized API endpoints with support for offset and limit
- Improved performance through more efficient database queries
</details>

<details>
<summary>Beta v1.4.0</summary>

#### 🔄 Updates

- Moderation page improved with additional features
- Functioning comment stream implemented
- Prepared reported content system
- Added API route for moderator comment deletion
- Added quote functionality for comments
- Implemented badges in comments that respect banned users in filter list

#### 💬 Complete Comment System

- Enhanced comment functionality with GIF and emoji integration
- User comment editing and deletion capabilities
- Improved reply threading for nested discussions
- API endpoints for comment management (GET, POST, PATCH, DELETE)
- Enhanced error handling for comments
- Support for anonymous commenting without login
- Extended permission system for comment moderation

#### 🛠️ Fixes

- Fixed routes and hotlinks for comments
- Corrected meta title for /user/nickname
- Implemented fix that automatically removes leftover MongoDB object IDs
</details>

<details>
<summary>Beta v1.3.0</summary>

- 💬 Comment System Enhancement
  - Live comment functionality activated
  - Comment moderation system enabled
  - Reply threading with nested responses
  - Editing and deleting capabilities for users
  - GIF support in comments with GIPHY integration
  - Anonymous commenting option
</details>

<details>
<summary>Beta v1.2.2</summary>

- 👤 User Profile Improvements
  - Fixed user bio display in posts
  - Standardized user statistics display across components
  - Improved user profile information consistency
  - Better organization of user metadata
- 🖼️ UI/UX Refinements
  - Streamlined statistics display on homepage
  - Removed redundant stats box in post views
  - Improved overall visual consistency
</details>

<details>
<summary>Beta v1.2.0</summary>

- 🛠️ Technical Improvements
  - Better environment variable management
  - Optimized file upload system
  - Improved permissions for uploads
  - Updated dependencies
</details>

<details>
<summary>Beta v1.1.1</summary>

- 🖼️ UI/UX Improvements
  - Better metadata management across all pages
  - Fixed issues with user role display
  - Improved responsive design
  - Enhanced logo functionality
  - Better dark mode support
- 🔒 Security Enhancements
  - Improved role-based access control
  - Better error handling
  - Enhanced user validation
- 🚀 Performance Optimizations
  - Faster page loads
  - Reduced bundle size
  - Improved image loading
</details>

<details>
<summary>Beta v1.1.0</summary>

- 🎨 Upload System!
  - Anonymous uploads without account requirement
  - Improved image processing
  - Better error handling
  - Progress indicators
  - File type validation
  - Automatic image optimization
- 👤 User System Improvements
  - Optional account system
  - Enhanced role badges
  - Anonymous posting support
  - Better date formatting
  - Default avatars for anonymous posts
- 🖼️ Image Display Enhancements
  - Improved grid layout
  - Better image scaling
  - Enhanced mobile view
  - Faster loading times
  - Optimized thumbnails
</details>

<details>
<summary>Beta v1.0.7</summary>

- 💬 Enhanced Comment System
  - WebSocket integration for live updates
  - Automatic spam detection
  - Role-based moderation system
  - Report functionality
  - Activity feed in user profiles
  - Comment threading improvements
- 👤 User System Enhancements
  - Role badges (Admin, Mod, Premium)
  - Activity tracking
  - Profile statistics
- 🔒 Security Updates
  - Spam protection
  - Report handling
  - Moderation tools
</details>

<details>
<summary>Beta v1.0.6</summary>

- 🎨 Enhanced comment system
  - GIPHY integration with attribution
  - Improved media display
  - Premium user badges
  - Better reply formatting
- 🚀 Performance optimizations
- 🎯 UI/UX improvements
</details>

## 🌐 Links & Support

- [Website](https://f0ck.org)
- [Discord](https://discord.gg/SmWpwGnyrU)
- [Ko-fi](https://ko-fi.com/f0ck_org)

## 📜 License

MIT License - © 2024 f0ck.org Team

> Beta Version 2.3.0 - We build something new...

