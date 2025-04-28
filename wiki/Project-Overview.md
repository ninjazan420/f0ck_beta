# Project Overview

f0ck.org is a modern anonymous imageboard platform that combines the best of traditional imageboards with modern web technologies. The project aims to provide a user-friendly, feature-rich platform for image sharing while respecting user privacy and offering optional account features.

## Core Principles

- **Anonymous by default**: Users can upload and interact without requiring an account
- **Optional user accounts**: Enhanced features available for registered users
- **Modern UI/UX**: Clean, responsive design with features like infinite scroll
- **Comprehensive media support**: Images, videos, and GIFs with automatic processing
- **Real-time interaction**: Live comment system with WebSocket integration
- **Persistent settings**: User preferences saved in localStorage
- **Mobile-first approach**: Optimized for all device sizes
- **Moderation tools**: Comprehensive tools for content moderation

## Key Features

### Comprehensive Media System

- **Fully functional upload system**:
  - Support for anonymous uploads without account requirement
  - Optimized image and video processing with automatic thumbnail generation
  - Advanced file type validation and error handling
  - Copy & Paste functionality and direct uploading via image grabbing
  - Reliable processing of thumbnails and original images
  - Complete video upload support with chunked uploads
  - Automatic video thumbnail generation

### Complete Tag System

- **Organize and discover content with tags**:
  - Up to 10 tags per upload for better findability
  - Simplified tag structure without category distinctions
  - Powerful tag search with combinable search criteria
  - Intelligent tag validation for consistent taxonomy

### Enhanced Comment Features

- **Comprehensive comment system**:
  - Live comments with WebSocket integration
  - GIF and emoji support through GIPHY integration
  - Extended functions: edit, delete, quote
  - Reply threading for nested discussions
  - Support for anonymous commenting

### Advanced Search Features

- **Advanced filter and search options**:
  - Extensive filtering options (uploader, commenter, likes, date)
  - Flexible sorting options (newest, oldest, most likes, most comments)
  - Reverse Image Search for similar image search
  - Support for registration period filter
  - Intelligent pagination with page navigator

### Improved User Interface

- **Optimized navigation and user-friendliness**:
  - New avatar system with improved functionality
  - Improved post navigation with arrow key support
  - Responsive design optimized for mobile devices
  - Persistent user settings in localStorage
  - Improved display of user statistics and metadata

## Tech Stack

The f0ck.org platform is built using modern web technologies:

- **Frontend Framework**: Next.js 15.3 with App Router
- **Styling**: TailwindCSS, Styled Components
- **Typography**: Geist Font
- **Architecture**: React Server Components
- **Real-time Communication**: WebSocket Integration
- **Deployment**: Vercel Edge Runtime, Docker Support
- **Database**: MongoDB Atlas
- **Media Integration**: GIPHY API
- **Package Manager**: npm 11.3