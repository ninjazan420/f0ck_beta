# Troubleshooting Guide

This guide provides solutions to common issues you might encounter when working with the f0ck.org platform.

## Common Issues and Solutions

### Installation Issues

#### Node.js Version Compatibility

**Issue**: Errors related to Node.js version compatibility.

**Solution**: 
- Ensure you're using Node.js v20 or higher
- If using nvm, run `nvm use 20` to switch to the correct version
- Check your npm version with `npm -v` (should be 11.0.0 or higher)

#### MongoDB Connection Problems

**Issue**: Unable to connect to MongoDB.

**Solution**:
- Verify your MongoDB connection string in the `.env.local` file
- Ensure MongoDB is running (locally or remotely)
- Check network connectivity to your MongoDB instance
- Verify that your IP address is whitelisted if using MongoDB Atlas

### Development Server Issues

#### Port Already in Use

**Issue**: Error message indicating port 3001 is already in use.

**Solution**:
- Find and terminate the process using port 3001
- Alternatively, modify the port in the `package.json` file:
  ```json
  "dev": "next dev --turbopack -p 3002",
  ```

#### Hot Reload Not Working

**Issue**: Changes to files are not reflected in the browser.

**Solution**:
- Restart the development server
- Clear browser cache
- Check for syntax errors in your code
- Ensure you're not using incompatible dependencies

### Upload Functionality Issues

#### File Upload Failures

**Issue**: Unable to upload files or uploads fail silently.

**Solution**:
- Check upload directory permissions
- Verify that the upload directories exist
- Check file size limits in your configuration
- Inspect browser console for JavaScript errors

#### Thumbnail Generation Problems

**Issue**: Thumbnails not generating correctly.

**Solution**:
- Ensure Sharp is installed correctly
- Check for file format compatibility
- Verify that the thumbnails directory is writable
- Check server logs for specific error messages

### Authentication Issues

#### Login Problems

**Issue**: Unable to log in or stay logged in.

**Solution**:
- Clear browser cookies and try again
- Check that your NEXTAUTH_SECRET is properly set
- Verify that your NEXTAUTH_URL matches your actual URL
- Check for CORS issues if accessing from a different domain

#### "Stay Logged In" Not Working

**Issue**: Session expires despite selecting "Stay logged in" option.

**Solution**:
- Ensure the JWT configuration is correct
- Check that cookies are being properly set
- Verify that your browser accepts cookies
- Check for any middleware that might be affecting authentication

### Comment System Issues

#### Comments Not Appearing

**Issue**: New comments are not visible after posting.

**Solution**:
- Check WebSocket connection status
- Refresh the page to force a reload
- Verify that the comment was successfully saved to the database
- Check for any moderation settings that might be filtering comments

#### GIFs Disappearing in Comments

**Issue**: GIFs disappear when adding text to a comment reply.

**Solution**:
- Ensure you're adding text before inserting the GIF
- Try using a different browser
- Check for JavaScript errors in the console
- Verify that the GIPHY API key is valid

### UI/UX Issues

#### Mobile Display Problems

**Issue**: UI elements not displaying correctly on mobile devices.

**Solution**:
- Use responsive design tools to test different screen sizes
- Check for CSS conflicts
- Verify that media queries are working correctly
- Test on multiple devices and browsers

#### Filter Settings Not Persisting

**Issue**: Content filter settings (safe/sketchy/unsafe) reset after page refresh.

**Solution**:
- Check localStorage implementation
- Clear browser cache and try again
- Verify that the filter settings are being properly saved
- Check for any code that might be resetting the filters

## Reporting Issues

If you encounter an issue not covered in this guide:

1. Check the GitHub repository's issue tracker for similar problems
2. Gather relevant information (error messages, steps to reproduce, environment details)
3. Create a new issue with a clear description of the problem
4. Include any relevant logs or screenshots

## Getting Additional Help

If you need further assistance:

- Join our [Discord server](https://discord.gg/SmWpwGnyrU) for community support
- Check the [API Documentation](API-Documentation) for endpoint-specific issues
- Review the [Installation Guide](Installation-Guide) for setup-related problems
- Contact the project maintainers directly for critical issues
