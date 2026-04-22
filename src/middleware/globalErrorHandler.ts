import type { NextFunction, Request, Response } from "express";

export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const statusCode = error.status || 500;
  const { message, errors } = error;

  console.log(error.stack);

  res.status(statusCode).json({
    success: false,
    ...(message && { message }),
    ...(errors && { errors }),
  });
}
