# Video Upload Guide

This guide provides detailed information about the video upload functionality in f0ck.org, introduced in version 3.0.1.

## Video Upload Features

The f0ck.org platform supports comprehensive video upload capabilities:

- **Supported Formats**: MP4, WebM, MOV, AVI
- **Maximum File Size**: 100MB (configurable)
- **Chunked Uploads**: Large videos are automatically split into chunks for reliable uploading
- **Automatic Thumbnail Generation**: Thumbnails are created from video frames
- **Video Player**: Custom video player with playback controls

## How to Upload Videos

### Method 1: Standard Upload

1. Navigate to the upload page
2. Click the upload area or drag and drop your video file
3. Wait for the upload and processing to complete
4. Add a title, description, and tags
5. Set the content rating (safe/sketchy/unsafe)
6. Click "Submit" to publish your video

### Method 2: URL Import

1. Navigate to the upload page
2. Click the "Import from URL" option
3. Paste a direct link to a video file
4. Wait for the download and processing to complete
5. Add a title, description, and tags
6. Set the content rating
7. Click "Submit" to publish your video

## Chunked Upload Process

For larger videos, the platform uses a chunked upload process:

1. The video file is split into smaller chunks (typically 2MB each)
2. Each chunk is uploaded sequentially
3. The server reassembles the chunks into the complete video
4. Processing begins once all chunks are received

This approach provides several benefits:
- More reliable uploads, especially on unstable connections
- Progress tracking for large files
- Ability to resume interrupted uploads
- Reduced server memory usage

## Video Processing

After upload, videos go through several processing steps:

1. **Format Validation**: Ensuring the file is a valid video format
2. **Thumbnail Generation**: Creating a preview image from a video frame
3. **Metadata Extraction**: Retrieving information like duration, dimensions, and codec
4. **Storage**: Saving the processed video to the server

## Playback Features

The video player includes:

- Play/pause controls
- Volume adjustment
- Fullscreen mode
- Playback speed control
- Timestamp display
- Autoplay option (disabled by default)

## Troubleshooting Video Uploads

### Common Issues

#### Upload Fails or Times Out

**Possible causes and solutions**:
- File is too large: Try compressing the video or using a different format
- Network connection is unstable: Try uploading on a more stable connection
- Server is experiencing high load: Try again later

#### Video Processes but Won't Play

**Possible causes and solutions**:
- Unsupported codec: Convert the video to a more widely supported format like MP4
- Corrupted file: Check if the video plays properly on your device before uploading
- Browser compatibility: Try a different browser

#### Poor Video Quality

**Possible causes and solutions**:
- Original video quality was low: Upload a higher quality source
- Processing compression: For best quality, use MP4 format with H.264 encoding

## Best Practices

For the best experience when uploading videos:

1. **Use Supported Formats**: MP4 with H.264 encoding works best across all platforms
2. **Optimize File Size**: Compress videos when possible without significant quality loss
3. **Stable Connection**: Use a stable internet connection for uploading
4. **Add Descriptive Tags**: Help others find your video with relevant tags
5. **Appropriate Content Rating**: Correctly mark content as safe, sketchy, or unsafe

## Technical Details

The video upload system uses:

- **Client-side Chunking**: JavaScript-based file splitting
- **Progress Tracking**: Real-time upload progress monitoring
- **Server Processing**: FFmpeg for thumbnail generation and video processing
- **Storage**: Optimized file storage system with separate directories for originals and processed files

## Future Enhancements

Planned improvements to the video system include:

- Multiple resolution options
- Adaptive streaming
- Custom thumbnail selection
- Video editing capabilities
- Enhanced playback controls
