'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface ChunkedUploaderProps {
  onUploadComplete: (result: UploadResult) => void;
  onUploadProgress?: (progress: number) => void;
  onUploadError?: (error: string) => void;
  maxChunkSize?: number;
}

interface UploadResult {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl: string;
  rating: string;
  uploadDate: string;
  tags: string[];
  uploader: string;
}

export function ChunkedUploader({ 
  onUploadComplete, 
  onUploadProgress, 
  onUploadError,
  maxChunkSize = 5 * 1024 * 1024 // 5MB chunks as default
}: ChunkedUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to assemble chunks on the server
  const assembleChunks = useCallback(async (fileId: string, fileName: string) => {
    try {
      const response = await fetch('/api/upload/assemble-chunks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileId,
          fileName
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error assembling chunks');
      }
      
      const result = await response.json();
      console.log('Upload completed:', result);
      
      setUploading(false);
      setProgress(100);
      
      // Call callback with the result
      if (result.file) {
        onUploadComplete(result.file);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during assembly';
      console.error('Error during assembly:', errorMessage);
      setError(errorMessage);
      if (onUploadError) onUploadError(errorMessage);
      setUploading(false);
    }
  }, [onUploadComplete, onUploadError]);

  // Function to start the upload
  const startUpload = useCallback(async () => {
    if (!file) {
      setError('No file selected');
      if (onUploadError) onUploadError('No file selected');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    const newFileId = uuidv4();
    setFileId(newFileId);

    try {
      // Split file into chunks
      const chunkCount = Math.ceil(file.size / maxChunkSize);
      
      // Upload metadata
      const totalFileSize = file.size;
      
      console.log(`Starting upload of ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB) in ${chunkCount} chunks`);
      
      // Upload all chunks
      for (let i = 0; i < chunkCount; i++) {
        const start = i * maxChunkSize;
        const end = Math.min(file.size, start + maxChunkSize);
        const chunk = file.slice(start, end);
        
        // Formdata for chunk upload
        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('chunkIndex', i.toString());
        formData.append('totalChunks', chunkCount.toString());
        formData.append('fileId', newFileId);
        formData.append('fileName', file.name);
        formData.append('totalFileSize', totalFileSize.toString());
        
        // Upload chunk
        const response = await fetch('/api/upload/chunk', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error uploading chunk');
        }
        
        // Update progress
        const newProgress = Math.round(((i + 1) / chunkCount) * 100);
        setProgress(newProgress);
        if (onUploadProgress) onUploadProgress(newProgress);
        
        // Process chunk response
        const chunkResult = await response.json();
        console.log(`Chunk ${i + 1}/${chunkCount} uploaded:`, chunkResult);
        
        // If this is the last chunk, assemble the complete upload
        if (chunkResult.isLastChunk) {
          await assembleChunks(newFileId, file.name);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during upload';
      console.error('Upload failed:', errorMessage);
      setError(errorMessage);
      if (onUploadError) onUploadError(errorMessage);
      setUploading(false);
    }
  }, [file, maxChunkSize, onUploadProgress, onUploadError, assembleChunks]);

  // File selection handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  // Reset function
  const resetUpload = () => {
    setFile(null);
    setFileId('');
    setProgress(0);
    setError(null);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="chunked-uploader p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-3">Upload Video (max. 100MB)</h3>
      
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          disabled={uploading}
          accept="video/mp4,video/webm,video/quicktime"
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
        />
        {file && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
          </p>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-2 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-300">
          {error}
        </div>
      )}
      
      {uploading && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-purple-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {progress}% uploaded
          </p>
        </div>
      )}
      
      <div className="flex flex-row space-x-2">
        <button
          onClick={startUpload}
          disabled={!file || uploading}
          className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:ring-4 focus:outline-none focus:ring-purple-300 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Start Upload'}
        </button>
        
        <button
          onClick={resetUpload}
          disabled={uploading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset
        </button>
      </div>
    </div>
  );
} 