import mongoose from "mongoose";

export function errorHandler(error: unknown) {
  console.log((error as { stack: string }).stack);

  if (error instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(error.errors).map((err) => ({
      field: err.path,
      message: err.message,
    }));

    return { status: 400, errors };
  }

  if ((error as { code: number }).code === 11000) {
    return {
      status: 409,
      message: `Field ${Object.keys((error as { keyValue: {} }).keyValue)[0]} already taken`,
    };
  }

  if (error instanceof mongoose.Error.CastError) {
    return { status: 400, message: "Invalid id" };
  }

  if ((error as { isManualError: boolean }).isManualError) {
    const { status, message } = error as { status: number; message: string };
    return { status, message };
  }

  return { status: 500, message: (error as { stack: string }).stack };
}
