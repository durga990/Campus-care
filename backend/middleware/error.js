import { ZodError } from 'zod';
import multer from 'multer';

export const notFound = (req, _res, next) => {
  const e = new Error(`Route not found: ${req.method} ${req.originalUrl}`); e.status = 404; e.isOperational = true; next(e);
};

export const errorHandler = (err, _req, res, _next) => {
  let status = err.status || 500, message = err.message, errors = err.errors || [];
  if (err instanceof ZodError) {
    status = 400; message = 'Validation failed.';
    errors = err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
  } else if (err instanceof multer.MulterError) {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Each image must be 5MB or smaller.'
      : err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE' ? 'You can upload at most 5 images.' : 'File upload failed.';
  } else if (err.name === 'CastError') { status = 400; message = 'Invalid identifier.'; }
  else if (err.code === 11000) {
    status = 409; const f = Object.keys(err.keyPattern || {})[0];
    message = f === 'email' ? 'An account with this email already exists.' : f === 'studentId' ? 'This student ID is already registered.' : 'Duplicate record.';
  } else if (!err.isOperational) {
    console.error(err);
    status = 500; message = 'Something went wrong. Please try again.';
    if (process.env.NODE_ENV !== 'production') errors = [{ message: err.message }];
  }
  res.status(status).json({ success: false, message, errors });
};
