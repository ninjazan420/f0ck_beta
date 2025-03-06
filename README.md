# f0ck.org Beta v1.7.0

> ⚠️ **Development Notice**: This project is currently under active development. A public live version is online, but many functions are still broken.

Modern, next-generation anonymous imageboard platform built with Next.js 14 and TailwindCSS. Upload and share images freely - accounts optional!

![grafik](https://github.com/user-attachments/assets/b35c9f71-d950-4b09-9943-f228cfbd8889)

![grafik](https://github.com/user-attachments/assets/a5c4631b-90c7-497e-81e3-4c18cb0e96b5)

![grafik](https://github.com/user-attachments/assets/e16a991f-6230-4819-a7f4-b38884fad9a2)

## 📋 Table of Contents

- [f0ck.org Beta v1.7.0](#f0ckorg-beta-v170)
  - [📋 Table of Contents](#-table-of-contents)
  - [⚡ Features](#-features)
  - [🚀 Installation](#-installation)
    - [Development Setup](#development-setup)
    - [Production Setup with Docker](#production-setup-with-docker)
    - [Environment Setup](#environment-setup)
  - [🛠️ Tech Stack](#️-tech-stack)
  - [🔥 Latest Updates](#-latest-updates)
    - [Beta v1.7.0 (Current)](#beta-v170-current)
      - [👤 Improved User Interface](#-improved-user-interface)
      - [🚀 New Features](#-new-features)
      - [🛠️ Bug Fixes](#️-bug-fixes)
    - [Beta v1.6.0](#beta-v160)
      - [🏷️ Tag System Fully Implemented](#️-tag-system-fully-implemented)
      - [🔍 Key Functional Improvements](#-key-functional-improvements)
      - [🎨 UI Refinements](#-ui-refinements)
    - [Older Versions (click to expand)](#older-versions-click-to-expand)
      - [🔍 Search Improvements](#-search-improvements)
      - [📱 Mobile Optimization](#-mobile-optimization)
      - [🚀 Performance Enhancements](#-performance-enhancements)
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

### Production Setup with Docker

```bash
# Clone the repository
git clone https://github.com/ninjazan420/f0ck_beta.git

# Navigate to project directory
cd f0ck_beta

# Rename env.template to either .env.production or .env.local (for dev)
.env.template

# Build and start Docker containers
docker compose up -d
```

The production server will be available at:

- **URL**: `http://localhost:3001`
- **API**: `http://localhost:3001/api`
- **WebSocket**: `ws://localhost:3001` (automatically configured)

You can also use the npm script:

```bash
npm run docker:prod
```

### Environment Setup

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=your_mongodb_uri
GIPHY_API_KEY=your_giphy_api_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3001
PORT=3001
NODE_ENV=development
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **Typography**: Geist Font
- **Architecture**: React Server Components
- **Real-time**: WebSocket Integration
- **Deployment**: Docker & Vercel Edge Runtime
- **Database**: MongoDB Atlas
- **Media**: GIPHY API Integration

## 🔥 Latest Updates

### Beta v1.7.0 (Current)

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

### Beta v1.6.0

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

### Older Versions (click to expand)

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

- 🐳 Docker Integration
  - Docker support for easy deployment and environment consistency
  - Simplified production build with `docker compose`
  - Persistent uploads folder
  - Optimized MongoDB Atlas configuration
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


MIT License - © 2024 f0ck.org Team

