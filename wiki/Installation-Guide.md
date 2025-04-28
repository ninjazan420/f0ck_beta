# Installation Guide

This guide will walk you through the process of setting up the f0ck.org project for both development and production environments.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v20 or higher recommended)
- npm (v11 or higher)
- MongoDB (local or Atlas connection)
- Git

## Development Setup

Follow these steps to set up the project for development:

### 1. Clone the Repository

```bash
git clone https://github.com/ninjazan420/f0ck_beta.git
cd f0ck_beta
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
MONGODB_URI=your_mongodb_uri
GIPHY_API_KEY=your_giphy_api_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3001
NODE_ENV=development
PUBLIC_URL=http://localhost:3001
```

- `MONGODB_URI`: Your MongoDB connection string
- `GIPHY_API_KEY`: API key from GIPHY for GIF integration
- `NEXTAUTH_SECRET`: A secret string for NextAuth.js (generate a random string)
- `NEXTAUTH_URL`: The URL where your app is running
- `PUBLIC_URL`: The public URL of your application (same as NEXTAUTH_URL for development)

### 4. Start the Development Server

```bash
npm run dev
```

The development server will be available at:

- **URL**: `http://localhost:3001`
- **API**: `http://localhost:3001/api`
- **WebSocket**: `ws://localhost:3001` (automatically configured)

## Production Setup

For production deployment, follow these steps:

### 1. Clone the Repository

```bash
git clone https://github.com/ninjazan420/f0ck_beta.git
cd f0ck_beta
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file with production settings:

```env
MONGODB_URI=your_production_mongodb_uri
GIPHY_API_KEY=your_giphy_api_key
NEXTAUTH_SECRET=your_production_nextauth_secret
NEXTAUTH_URL=https://your-production-domain.com
NODE_ENV=production
PUBLIC_URL=https://your-production-domain.com
```

### 4. Build and Start the Production Server

```bash
npm run build
npm run start
```

Alternatively, you can use the combined production command:

```bash
npm run prod
```

## Directory Structure Initialization

The application will automatically create necessary directories for file uploads. These directories are:

- `/public/uploads/original` - For original uploaded images
- `/public/uploads/thumbnails` - For generated thumbnails
- `/public/uploads/temp` - For temporary files during processing

If you encounter any permissions issues, ensure these directories have write permissions.

## Database Initialization

The application will automatically:

1. Connect to the MongoDB database
2. Create necessary collections
3. Set up required indexes for optimal performance

No manual database setup is required.

## Troubleshooting

If you encounter any issues during setup:

1. Check that MongoDB is running and accessible
2. Verify environment variables are correctly set
3. Ensure all dependencies installed correctly
4. Check for any permissions issues with upload directories

For more specific problems, refer to the error logs or open an issue on the GitHub repository.