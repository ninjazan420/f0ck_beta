# f0ck.org Beta 3.4.2

> ⚠️ **Development Notice**: This project is currently under active development. A public live version is online, but many functions are still being improved.

Modern, next-generation anonymous imageboard platform built with Next.js 15 and TailwindCSS. Upload and share images freely - accounts optional!

![grafik](https://github.com/user-attachments/assets/b35c9f71-d950-4b09-9943-f228cfbd8889)

![grafik](https://github.com/user-attachments/assets/a5c4631b-90c7-497e-81e3-4c18cb0e96b5)

![grafik](https://github.com/user-attachments/assets/e16a991f-6230-4819-a7f4-b38884fad9a2)

## 📋 Table of Contents

- [f0ck.org Beta 3.4.2](#f0ckorg-beta-342)
  - [📋 Table of Contents](#-table-of-contents)
  - [⚡ Features](#-features)
    - [📷 Anonymous Image Sharing](#-anonymous-image-sharing)
    - [🎬 Multi-Media Support](#-multi-media-support)
    - [💬 Real-Time Comment System](#-real-time-comment-system)
    - [👤 User Profiles (Optional)](#-user-profiles-optional)
    - [⭐ Premium Features](#-premium-features)
    - [🎨 Modern UI/UX](#-modern-uiux)
    - [🔒 Security](#-security)
  - [🚀 Installation](#-installation)
    - [Development Setup](#development-setup)
    - [Production Setup](#production-setup)
    - [Environment Setup](#environment-setup)
  - [🛠️ Tech Stack](#️-tech-stack)
  - [🔥 Latest Updates](#-latest-updates)
    - [Beta v3.4.2 (Current)](#beta-v342-current)
    - [Beta v3.4.1](#beta-v341)
    - [Beta v3.4.0](#beta-v340)
      - [🔍 Optimized Tag Filters](#-optimized-tag-filters)
      - [🔄 Enhanced User Interaction](#-enhanced-user-interaction)
      - [🔗 Improved Comment Functions](#-improved-comment-functions)
      - [🧹 System Optimizations](#-system-optimizations)
    - [Beta v3.3.0](#beta-v330)
      - [🏷️ Enhanced Tag Functionality](#️-enhanced-tag-functionality)
      - [👤 Anonymous Uploads](#-anonymous-uploads)
      - [📌 Fixes](#-fixes)
    - [Beta v3.2.0](#beta-v320)
      - [💬 Enhanced Comment Functionality](#-enhanced-comment-functionality)
      - [🏷️ Improved Tag System](#️-improved-tag-system)
      - [📊 UI Refinements](#-ui-refinements)
      - [🔄 Interaction Enhancements](#-interaction-enhancements)
    - [Beta v3.1.0](#beta-v310)
      - [🎨 Enhanced User Experience](#-enhanced-user-experience)
      - [🎬 Enhanced Media Handling](#-enhanced-media-handling)
      - [🔒 Privacy \& Security](#-privacy--security)
      - [🛠️ Technical Improvements](#️-technical-improvements)
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

### 📷 Anonymous Image Sharing

- **No Account Required** - Upload images without registration
- **Quick & Easy** - Simple posting process with minimal steps
- **Smart Processing** - Automatic thumbnails and intelligent resizing
- **Large File Support** - Upload high-resolution images with ease
- **Optional Accounts** - Register for additional features and tracking

### 🎬 Multi-Media Support

- **Diverse Media Types** - Support for images, videos, and GIFs
- **GIPHY Integration** - Search and add GIFs directly from GIPHY
- **Rich Preview** - Embedded media previews with hover functionality
- **Optimized Thumbnails** - Fast-loading previews with full-size on demand

### 💬 Real-Time Comment System

- **Rich Formatting** - Text styling, emojis, and GIF support in comments
- **Live Updates** - WebSocket integration for instant comment visibility
- **Threaded Replies** - Organized conversation structure
- **@Mentions** - Tag users with notifications
- **Moderation Tools** - Spam detection, reporting, and role-based moderation

### 👤 User Profiles (Optional)

- **Customizable Profiles** - Personalize your presence
- **Activity Feed** - Track your contributions and interactions
- **Role Badges** - Display status (Admin, Mod, Premium)
- **Statistics** - View your platform engagement metrics

### ⭐ Premium Features

- **Custom Nicknames** - Personalize your identity
- **Ad-Free Experience** - Browse without advertisements
- **Exclusive Themes** - Access to premium visual styles
- **Premium Badges** - Show off your supporter status

### 🎨 Modern UI/UX

- **Theme Options** - Dark and light mode support
- **Infinite Scroll** - Seamless content browsing
- **Responsive Grid** - 7x4 layout with intelligent image adjustment
- **Intuitive Design** - User-friendly interface across all devices

### 🔒 Security

- **Comprehensive Protection** - Integrated security systems
- **Anti-Spam** - Automated spam detection and prevention
- **Role-Based Access** - Granular permission controls
- **Report System** - User-driven content moderation

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

- **URL**: `http://localhost:3001`
- **API**: `http://localhost:3001/api`
- **WebSocket**: `ws://localhost:3001` (automatically configured)

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
NEXTAUTH_URL=http://localhost:3001
NODE_ENV=development
PUBLIC_URL=http://localhost:3001
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.1 (App Router)
- **Styling**: TailwindCSS, Styled Components
- **Typography**: Geist Font
- **Architecture**: React Server Components
- **Real-time**: WebSocket Integration
- **Deployment**: Vercel Edge Runtime
- **Database**: MongoDB Atlas
- **Media**: GIPHY API Integration
- **Package Manager**: npm 11.3.0

## 🔥 Latest Updates

### Beta v3.4.2 (Current)

- **Bug fixes**:

  - /account page fixed: avatar and bio finally editable
  - The order of "Previous" and "Next" buttons has been reversed, so "Next" is now on the left and "Previous" on the right. Keyboard navigation has been adjusted accordingly, so the left arrow key (or 'A') leads to the newer post and the right arrow key (or 'D') to the older post.
  - Page switcher from /tags and /user aligned according to /posts
  - Correctly updates the statistics of likes and dislikes when a user switches between like and dislike
  - No more infinite disliking possible

### Beta v3.4.1

- **Technology updates**:

  - Update of Next.js from 15.2.3 to 15.3.1
  - Update of npm from 11.2.0 to 11.3.0
  - Optimised remotePatterns configuration with new URL() support
  - Improved TypeScript plugin performance

- **Bug fixes**:

  - Upload date and upload time in post/id fixed
  - Refresh no longer updates ‘last seen’ from user (LOL)
  - Page changer was broken due to infinite scroll
  - Stay Login did not work due to JWT error; it's fixed
  - Logic of comments fixed (there were Approved and Rejected comments, this no longer exists)
  - Case sensivite nicks are now linked correctly
  - Nicknames are now highlighted
  - Comments with line breaks are now displayed with line breaks

### Beta v3.4.0

#### 🔍 Optimized Tag Filters

- **Improved Filter Page**:

  - Significantly faster loading times for tag filter page
  - New sorting for statistics with "Trending" as default
  - Optimized loading strategy: Only 20 tags loaded at once
  - Improved display of time filters (+week and +today)

#### 🔄 Enhanced User Interaction

- **Optimized Routes and Responses**:

  - Fixed routes for better navigation
  - Fixed date filters for more precise time settings
  - Corrected session responses for more stable user sessions
  - CSS adjustments to buttons for improved usability

#### 🔗 Improved Comment Functions

- **Enhanced Linking**:

  - Fixed comment hotlinks to external URLs
  - Improved display of external links in comments

#### 🧹 System Optimizations

- **Simplified Structure**:

  - Temporary removal of pools feature
  - Removal of beta authentication
  - Optimized callback functions for reduced loading times

### Beta v3.3.0

#### 🏷️ Enhanced Tag Functionality

- **Improved Tag Management**:

  - Support for copying and pasting multiple tags at once
  - Automatic separation of multiple words into individual tags
  - Batch tagging for multiple uploads simultaneously
  - Optimized tag processing for more efficient tagging

#### 👤 Anonymous Uploads

- **Enhanced Privacy**:

  - Removal of statistics and avatars for anonymous uploads
  - Optimized display for non-logged-in users
  - Improved user experience for anonymous uploads

#### 📌 Fixes

- **Pin Function Correction**:

  - Pinned posts now display correctly on the first page
  - Fixed pagination for pinned posts
  - Improved consistency in post display

### Beta v3.2.0

#### 💬 Enhanced Comment Functionality

- **@-Mentions in Comments**:
  - Users can now mention others with @username in comments
  - Automatic notifications when mentioned
  - Smart username suggestions while typing
  - User-friendly autofill for faster mentions

#### 🏷️ Improved Tag System

- **Optimized Tag Requirements**:
  - Introduced minimum of 3 tags for each upload
  - Increased maximum tags to 15 for better content organization
  - Enhanced tag validation and input requirements

#### 📊 UI Refinements

- **Redesigned Voting System**:

  - Moved voting elements from overlay to sidebar
  - More intuitive voting behavior with better visibility
  - Post statistics hidden for anonymous users

- **Live Comment Reporting**:

  - Real-time tracking of reported comments for moderators
  - Faster response times for problematic content

#### 🔄 Interaction Enhancements

- **New Notification Features**:

  - Added share banner for easier content distribution
  - Integrated feedback banner for improved user interaction
  - More intuitive social features guidance

### Beta v3.1.0

#### 🎨 Enhanced User Experience

- **Improved Light Mode**:

  - Comprehensive light mode support across all components
  - Better contrast and readability in light theme
  - Consistent styling across both themes

#### 🎬 Enhanced Media Handling

- **Improved Video Support**:

  - Added video preview functionality during upload
  - Fixed activity feed type handling for both video and image content
  - Better media type detection and display

#### 🔒 Privacy & Security

- **Enhanced Content Protection**:

  - Activated blur effect for NSFW posts based on user settings
  - Improved content filtering mechanisms
  - Better user control over sensitive content

#### 🛠️ Technical Improvements

- **System Optimizations**:
  - Fixed boolean handling in switch component
  - Optimized middleware for localhost development
  - Improved WebSocket implementation with removed domain dependencies
  - Fixed comment listener error for better stability
  - Enhanced filename handling by removing domain names
  - Updated favicon for better brand recognition

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

> Beta Version 3.4.2 - We build something new...
