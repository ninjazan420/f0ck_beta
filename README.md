# f0ck.org Beta v1.1.1

> ⚠️ **Development Notice**: This project is currently under active development. A public live version is not yet available.

Modern, next-generation anonymous imageboard platform built with Next.js 14 and TailwindCSS. Upload and share images freely - accounts optional!

![grafik](https://github.com/user-attachments/assets/b35c9f71-d950-4b09-9943-f228cfbd8889)

![grafik](https://github.com/user-attachments/assets/a5c4631b-90c7-497e-81e3-4c18cb0e96b5)

![grafik](https://github.com/user-attachments/assets/e16a991f-6230-4819-a7f4-b38884fad9a2)

## 📋 Table of Contents

- [f0ck.org Beta v1.1.1](#f0ckorg-beta-v111)
  - [📋 Table of Contents](#-table-of-contents)
  - [⚡ Features](#-features)
  - [🚀 Installation](#-installation)
    - [Environment Setup](#environment-setup)
  - [🛠️ Tech Stack](#️-tech-stack)
  - [🔥 Latest Updates](#-latest-updates)
    - [Beta v1.1.1 (Current)](#beta-v111-current)
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
- **Deployment**: Vercel Edge Runtime
- **Database**: MongoDB Atlas
- **Media**: GIPHY API Integration

## 🔥 Latest Updates

### Beta v1.1.1 (Current)

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

### Older Versions (click to expand)

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
