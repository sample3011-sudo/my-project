import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // Multer errors (e.g. file size exceeded)
  if (err.name === 'MulterError') {
    const isSize = (err as any).code === 'LIMIT_FILE_SIZE';
    res.status(isSize ? 413 : 422).json({
      success: false,
      error: {
        code: isSize ? 'UPLOAD_FILE_TOO_LARGE' : 'UPLOAD_PARSE_ERROR',
        message: isSize ? 'File is too large. Maximum size is 10 MB.' : err.message,
      },
    });
    return;
  }

  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected server error occurred',
      details: err.stack,
    },
  });
};
