type ErrorType = 
  | 'ValidationError'
  | 'AuthenticationError'
  | 'DatabaseError'
  | 'UploadError'
  | 'NetworkError'
  | 'FileSystemError'
  | 'ImageProcessingError'
  | 'RateLimitError'
  | 'UnknownError';

interface AppError extends Error {
  type: ErrorType;
  statusCode: number;
  originalError?: unknown;
}

export class ApplicationError extends Error implements AppError {
  type: ErrorType;
  statusCode: number;
  originalError?: unknown;

  constructor(message: string, type: ErrorType, statusCode: number = 500, originalError?: unknown) {
    super(message);
    this.name = 'ApplicationError';
    this.type = type;
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof ApplicationError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApplicationError(
      error.message,
      'UnknownError',
      500,
      error
    );
  }

  return new ApplicationError(
    'An unknown error occurred',
    'UnknownError',
    500,
    error
  );
}

export function createErrorResponse(error: unknown) {
  const appError = handleError(error);
  
  return new Response(
    JSON.stringify({
      error: appError.message,
      type: appError.type
    }),
    {
      status: appError.statusCode,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

export const ERROR_MESSAGES = {
  UPLOAD_DIRECTORY_FAILED: 'Failed to initialize upload directories',
  IMAGE_PROCESSING_FAILED: 'Failed to process image',
  NETWORK_REQUEST_FAILED: 'Network request failed',
  FILE_SYSTEM_ERROR: 'File system operation failed',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded'
} as const; 