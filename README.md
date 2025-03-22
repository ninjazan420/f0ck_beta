# f0ck.org Beta v

> ⚠️ **Development Notice**: This project is currently under active development. A public live version is online, but many functions are still being improved.

Modern, next-generation anonymous imageboard platform built with Next.js 14 and TailwindCSS. Upload and share images freely - accounts optional!

![grafik](https://github.com/user-attachments/assets/b35c9f71-d950-4b09-9943-f228cfbd8889)

![grafik](https://github.com/user-attachments/assets/a5c4631b-90c7-497e-81e3-4c18cb0e96b5)

![grafik](https://github.com/user-attachments/assets/e16a991f-6230-4819-a7f4-b38884fad9a2)

## 📋 Table of Contents

- [f0ck.org Beta v](#f0ckorg-beta-v)
  - [📋 Table of Contents](#-table-of-contents)
  - [⚡ Features](#-features)
  - [🚀 Installation](#-installation)
    - [Development Setup](#development-setup)
    - [Production Setup](#production-setup)
    - [Environment Setup](#environment-setup)
  - [🛠️ Tech Stack](#️-tech-stack)
  - [🔥 Latest Updates](#-latest-updates)
    - [Beta v3.0.1 (Current)](#beta-v301-current)
      - [🎬 Video Upload Functionality](#-video-upload-functionality)
      - [🗳️ Enhanced Voting System](#️-enhanced-voting-system)
      - [🧹 Optimized Database Management](#-optimized-database-management)
      - [🛡️ Improved Moderation Tools](#️-improved-moderation-tools)
      - [🧩 UI/UX Improvements](#-uiux-improvements)
      - [🔒 Security Enhancements](#-security-enhancements)
    - [Beta v2.7.0 (Current)](#beta-v270-current)
      - [🎮 Enhanced Navigation and User Experience](#-enhanced-navigation-and-user-experience)
      - [🔧 Technical Improvements](#-technical-improvements)
    - [Previous Versions (click to expand)](#previous-versions-click-to-expand)
      - [💎 Redesigned Notification System](#-redesigned-notification-system)
      - [🎨 Styled Components Integration](#-styled-components-integration)
      - [📱 Mobile Enhancements](#-mobile-enhancements)
      - [🔍 Extended Comment Features](#-extended-comment-features)
      - [🌟 Enhanced Interaction Systems](#-enhanced-interaction-systems)
      - [📌 New Post Management Functions](#-new-post-management-functions)
      - [🔔 Notification System](#-notification-system)
      - [📊 Redesigned Statistics](#-redesigned-statistics)
      - [🖼️ Media Improvements](#️-media-improvements)
      - [🌟 New Feature System (v2.4.0)](#-new-feature-system-v240)
      - [🏠 Improved Frontend (v2.4.0)](#-improved-frontend-v240)
      - [🔍 Enhanced Moderation (v2.3.0)](#-enhanced-moderation-v230)
      - [🛠️ Technical Improvements (v2.2.0)](#️-technical-improvements-v220)
      - [🚀 State of the Art Beta Website (v2.0.0)](#-state-of-the-art-beta-website-v200)
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
- **Styling**: TailwindCSS, Styled Components
- **Typography**: Geist Font
- **Architecture**: React Server Components
- **Real-time**: WebSocket Integration
- **Deployment**: Vercel Edge Runtime
- **Database**: MongoDB Atlas
- **Media**: GIPHY API Integration

## 🔥 Latest Updates

### Beta v3.0.1 (Current)

#### 🎬 Video Upload Functionality

- **Complete Video Upload Support**:
  - Implementation of robust video upload capabilities
  - Chunked uploads for efficient large file transmission
  - Automatic thumbnail generation for videos
  - Optimized video display with custom player
  - Enhanced media versatility across the platform

#### 🗳️ Enhanced Voting System

- **Redesigned Voting Mechanism**:
  - Completely revamped and repositioned voting system
  - Fixed voting position on the /post/id page for better usability
  - More efficient processing of user interactions
  - Improved visual feedback for votes

#### 🧹 Optimized Database Management

- **Enhanced Cleanup Functions**:
  - Automatic removal of database arrays when posts are deleted
  - Complete cleanup of associated media files during post deletion
  - Improved user data integrity after post removal
  - Optimized storage usage through efficient file deletion

#### 🛡️ Improved Moderation Tools

- **Extended Moderation Capabilities**:
  - Revamped moderator tools for more efficient content management
  - Enhanced logging functions for moderation actions
  - Improved API endpoints for moderation tasks
  - Security updates for moderator access

#### 🧩 UI/UX Improvements

- **Enhanced User Interface**:
  - New switch design in settings and notifications
  - Enabled anonymous replies and reports
  - Improved visual consistency across all components
  - Optimized mobile view for better user experience

#### 🔒 Security Enhancements

- **Critical Bug Fixes**:
  - Fixed CVE-2025-29927 for improved platform security
  - Strengthened validation of user actions
  - Enhanced error handling and logging
  - Increased security for file uploads

### Beta v2.7.0 (Current)

#### 🎮 Enhanced Navigation and User Experience

- **Improved User Statistics**:
  - User statistics on /user/id and /post pages are now clickable and lead to corresponding uploads
  - Enhanced user interaction through more intuitive navigation elements
  - Consistent display of statistics across all components
- **Redesigned Tags Page**:
  - Complete redesign of the /tags page for better clarity
  - More compact tag boxes for efficient space usage
  - Improved visual hierarchy with clear statistics display
  - Better presentation of tag authors and related information
- **Optimized User Management**:
  - User page navigation improved to reach the current page state directly
  - Enhanced pagination with smarter page numbering
  - Optimized performance for displaying user directories

#### 🔧 Technical Improvements

- **Database Optimizations**:
  - Tag system extended: Added author to tags in database for proper filtering
  - Fixed post counter in MongoDB when deleting images through moderator panel
  - Improved data integrity and consistency in user interactions
- **Backend Adjustments**:
  - Updated contact email: mail[@]f0ck.org instead of support@f0ck.org
  - Optimized API endpoints for tag-related operations
  - Enhanced error handling for user filtering

### Previous Versions (click to expand)

<details>
<summary>Beta v2.6.0</summary>

#### 💎 Redesigned Notification System

- **Completely Overhauled Notification Interface**:
  - Redesigned notification page with improved organization and filtering
  - Newly styled notification bell for clearer visibility
  - Enhanced notification functions including "has replied" status
  - More comprehensive notification types for better user feedback
  - Optimized notification grouping and prioritization

#### 🎨 Styled Components Integration

- **Advanced Styling Capabilities**:
  - Added styled-components for more dynamic UI elements
  - Improved component isolation and reusability
  - Enhanced theming capabilities across the platform
  - Better separation of styling concerns in complex components

#### 📱 Mobile Enhancements

- **Improved Mobile Experience**:
  - Added notification bell functionality for mobile devices
  - Reorganized navbar with username and avatar positioned at far right
  - Enhanced touch interfaces for notification interaction
  - Responsive design improvements for various screen sizes

#### 🔍 Extended Comment Features

- **Enhanced Comment Functionality**:
  - Activated comment filtering system
  - Improved threading for better conversation tracking
  - Enhanced comment notifications with clearer context
  - Optimized comment loading performance
</details>

<details>
<summary>Beta v2.5.0</summary>

#### 🌟 Enhanced Interaction Systems

- **Comprehensive Like and Dislike System**:
  - Full implementation of like and dislike functionality
  - Optimistic UI updates for immediate user feedback
  - Consistent processing of user interactions across all pages
  - ModLog entries for improved tracking of all interactions

#### 📌 New Post Management Functions

- **Pinned Posts Feature**:
  - Ability to pin important posts to the top of the page
  - Improved visibility for important information
  - Intuitive pin/unpin system for administrators
  - Fixed "unfeature" type never error for reliable functionality

#### 🔔 Notification System

- **Enhanced Notifications for User Interactions**:
  - Real-time notifications for likes, dislikes and favorites
  - Clear feedback for all user interactions
  - Optimized processing and delivery of notifications

#### 📊 Redesigned Statistics

- **Redesigned Statistics Area on Homepage**:
  - Visual improvements for better data visualization
  - Replacement of template data with real-time data
  - More efficient updating of post statistics

#### 🖼️ Media Improvements

- **Optimized Image Display**:
  - Fixed image preview in metadata for better social sharing
  - Improved presentation of images in various contexts
  - Enhanced technical backend for media handling
</details>

<details>
<summary>Beta v2.4.0 and Earlier</summary>

#### 🌟 New Feature System (v2.4.0)

- **"Featured Post" Option**:
  - Moderators and admins can now highlight posts on the homepage
  - New API endpoints for featured post management
  - ModLog entries for feature/unfeature actions
  - Visual indication of featured posts

#### 🏠 Improved Frontend (v2.4.0)

- **Complete Redesign of Homepage**:
  - Modern layout with highlighted featured content
  - Enhanced statistics display with more detailed information
  - Responsive UI for all devices
  - New PostPreview component for consistent display

#### 🔍 Enhanced Moderation (v2.3.0)

- **Completely Redesigned Moderation Page**:
  - Improved interface with separate tabs for overview, comments, activity log, and actions
  - More intuitive navigation between different moderation areas
  - Optimized display of moderation activities

#### 🛠️ Technical Improvements (v2.2.0)

- **API Optimizations**:
  - Fixed params.id usage with await: `const id = Number(await params.id)`
  - Fixed "params should be awaited before using its properties" error
  - Removed anonymous links from documentation
  - Extensive security improvements and API optimizations

#### 🚀 State of the Art Beta Website (v2.0.0)

This version marks an important milestone for the f0ck.org project, consolidating all improvements and features from previous beta versions. It provides a stable foundation for future development with comprehensive media system, complete tag system, enhanced comment features, and advanced search capabilities.
</details>

## 🌐 Links & Support

- [Website](https://f0ck.org)
- [Discord](https://discord.gg/SmWpwGnyrU)
- [Ko-fi](https://ko-fi.com/f0ck_org)

## 📜 License

MIT License - © 2024 f0ck.org Team

> Beta Version  - We build something new...

