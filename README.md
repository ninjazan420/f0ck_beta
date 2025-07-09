# f0ck.org (beta 4.0.0)

[![Discord](https://img.shields.io/badge/Discord-Invite-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/SmWpwGnyrU)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/f0ck_org)
[![Version](https://img.shields.io/badge/Version-4.0.0-brightgreen?style=for-the-badge)](https://github.com/ninjazan420/f0ck_beta)

> **Development Notice**: This project is currently under active development. A public live version is online, but many functions are still being improved.

Modern, next-generation anonymous imageboard platform built with Next.js 15 and TailwindCSS. Upload and share images freely - accounts optional.

![Platform Preview](https://github.com/user-attachments/assets/b35c9f71-d950-4b09-9943-f228cfbd8889)

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Tech Stack](#tech-stack)
- [What's New in 4.0.0](#whats-new-in-400)
- [Links & Support](#links--support)
- [License](#license)

## Features

### Anonymous Image Sharing
Upload images without registration. Simple posting process with minimal steps, automatic thumbnails, and intelligent resizing. Large file support for high-resolution images. Optional accounts available for additional features. Little to none, but transparent moderation.

### Multi-Media Support
Support for images, videos, and GIFs with GIPHY integration. Rich media previews with hover functionality and optimized thumbnails for fast loading.

### Real-Time Comment System
Rich text formatting with emojis and GIF support. WebSocket integration for instant updates, threaded replies, @mentions with notifications, and comprehensive moderation tools.

### User Profiles (Optional)
Customizable profiles with activity feeds, role badges (Admin, Mod, Premium), and engagement statistics.

### Premium Features
Custom nicknames, ad-free experience, exclusive themes, and premium badges for supporters.

### Modern UI/UX
Dark and light mode support, infinite scroll, responsive 7x4 grid layout, and intuitive design across all devices.

### Security
Integrated security systems with anti-spam protection, role-based access controls, and user-driven content moderation.

## Installation

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

Development server runs at `http://localhost:3001` with API at `/api` and WebSocket automatically configured.

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

Production server runs at `http://localhost:3000` with API at `/api` and WebSocket automatically configured.

### Environment Configuration

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=your_mongodb_uri
GIPHY_API_KEY=your_giphy_api_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3001
NODE_ENV=development
PUBLIC_URL=http://localhost:3001
```

## Tech Stack

- **Framework**: Next.js 15.3.5 (App Router)
- **Styling**: TailwindCSS 4.1.11, Styled Components
- **Typography**: Geist Font
- **Architecture**: React Server Components
- **Real-time**: WebSocket Integration
- **Database**: MongoDB Atlas
- **Media**: GIPHY API Integration
- **Package Manager**: npm 11.4.2


 ### *4.0.0 Released July 9, 2025*

## Links & Support

- [Website](https://f0ck.org)
- [Discord](https://discord.gg/SmWpwGnyrU)
- [Ko-fi](https://ko-fi.com/f0ck_org)

## License

GPLv3 License - © 2025 f0ck.org Team

---

*Version 4.0.0 - Building the future of anonymous image sharing*
