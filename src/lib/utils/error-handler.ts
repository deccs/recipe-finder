// Error types
export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Custom error class
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly statusCode: number;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    statusCode: number = 500,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.statusCode = statusCode;
    this.context = context;
  }
}

// Error logging service
class ErrorLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  log(error: Error | AppError, context?: Record<string, unknown>): void {
    const errorData = {
      message: error.message,
      stack: error.stack,
      type: error instanceof AppError ? error.type : ErrorType.UNKNOWN,
      severity: error instanceof AppError ? error.severity : ErrorSeverity.MEDIUM,
      statusCode: error instanceof AppError ? error.statusCode : 500,
      context: context || (error instanceof AppError ? error.context : undefined),
      timestamp: new Date().toISOString(),
    };

    if (this.isDevelopment) {
      console.error('Error:', errorData);
    } else {
      // In production, you would send this to your error tracking service
      // e.g., Sentry, LogRocket, etc.
      this.sendToErrorTrackingService(errorData);
    }
  }

  private async sendToErrorTrackingService(errorData: Record<string, unknown>): Promise<void> {
    try {
      // Example implementation for sending to an error tracking service
      // In a real app, you would integrate with a service like Sentry
      if (typeof window !== 'undefined') {
        // Client-side error reporting
        // Example: Sentry.captureException(error);
      } else {
        // Server-side error reporting
        // Example: yourErrorTrackingService.captureException(error);
      }
    } catch (err) {
      // Fallback to console if error tracking fails
      console.error('Failed to report error:', err);
      console.error('Original error:', errorData);
    }
  }

  // Handle API errors
  handleApiError(error: unknown, context?: Record<string, unknown>): AppError {
    let appError: AppError;

    if (error instanceof AppError) {
      appError = error;
    } else if (error instanceof Error) {
      appError = new AppError(
        error.message,
        ErrorType.UNKNOWN,
        ErrorSeverity.MEDIUM,
        500,
        context
      );
    } else if (typeof error === 'string') {
      appError = new AppError(
        error,
        ErrorType.UNKNOWN,
        ErrorSeverity.MEDIUM,
        500,
        context
      );
    } else {
      appError = new AppError(
        'An unknown error occurred',
        ErrorType.UNKNOWN,
        ErrorSeverity.MEDIUM,
        500,
        context
      );
    }

    this.log(appError, context);
    return appError;
  }

  // Handle network errors
  handleNetworkError(error: unknown, context?: Record<string, unknown>): AppError {
    const appError = new AppError(
      'Network error occurred',
      ErrorType.NETWORK,
      ErrorSeverity.HIGH,
      503,
      context
    );

    this.log(appError, context);
    return appError;
  }

  // Handle authentication errors
  handleAuthError(error: unknown, context?: Record<string, unknown>): AppError {
    const appError = new AppError(
      'Authentication error',
      ErrorType.AUTHENTICATION,
      ErrorSeverity.HIGH,
      401,
      context
    );

    this.log(appError, context);
    return appError;
  }

  // Handle validation errors
  handleValidationError(error: unknown, context?: Record<string, unknown>): AppError {
    const appError = new AppError(
      error instanceof Error ? error.message : 'Validation error',
      ErrorType.VALIDATION,
      ErrorSeverity.LOW,
      400,
      context
    );

    this.log(appError, context);
    return appError;
  }

  // Handle not found errors
  handleNotFoundError(error: unknown, context?: Record<string, unknown>): AppError {
    const appError = new AppError(
      'Resource not found',
      ErrorType.NOT_FOUND,
      ErrorSeverity.LOW,
      404,
      context
    );

    this.log(appError, context);
    return appError;
  }
}

// Export singleton instance
export const errorLogger = new ErrorLogger();

// Helper function to handle async errors in API routes
export function withErrorHandling(
  handler: (req: Request, res: Response) => Promise<Response>
): (req: Request, res: Response) => Promise<Response> {
  return async (req: Request, res: Response) => {
    try {
      return await handler(req, res);
    } catch (error) {
      const appError = errorLogger.handleApiError(error, {
        url: req.url,
        method: req.method,
      });
      
      return new Response(
        JSON.stringify({
          error: appError.message,
          type: appError.type,
        }),
        {
          status: appError.statusCode,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  };
}