import type { searchQuery } from "@/types/general.types.js";
import type {
  createPostInput,
  updatePostInput,
  Comment,
} from "@/types/post.types.js";
import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export function validateAndHandle(validators: {
  create?: boolean | undefined;
  update?: boolean | undefined;
  query?: boolean | undefined;
  idCheck?: boolean | undefined;
  authorizationIdCheck?: boolean | undefined;
  commentCheck?: boolean | undefined;
}): (req: Request, res: Response, next: () => void) => void {
  return function (req: Request, res: Response, next: NextFunction) {
    const errors: string[] = [];
    const {
      create,
      update,
      query,
      idCheck,
      authorizationIdCheck,
      commentCheck,
    } = validators;

    if (query) {
      const result = validateQuery(req.query);
      errors.push(...result);
    }

    if (create) {
      const result = validateCreate(req.body);
      errors.push(...result);
    }

    if (update) {
      const result = validateUpdate(req.body);
      errors.push(...result);
    }

    if (idCheck) {
      const result = validateId(req.params.id);
      errors.push(...result);
    }

    if (authorizationIdCheck) {
      const result = validateAuthorization(req.body.authorId);
      errors.push(...result);
    }

    if (commentCheck) {
      const result = validateComment(req.body);
      errors.push(...result);
    }

    if (errors.length) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        details: errors,
      });
    }

    next();
  };
}

export function validateCreate(input: createPostInput): string[] {
  const { title, content, authorId, status, tags, categories } = input;
  const errors = [];

  if (title && typeof title !== "string") {
    errors.push("The title property must be string");
    return errors;
  }

  if (!title || !title.trim().length) {
    errors.push("The title property is required");
  }

  if (content && typeof content !== "string") {
    errors.push("The content property must be string");
    return errors;
  }

  if (!content || !content.trim().length) {
    errors.push("The content property is required");
  }

  if (!authorId || !mongoose.Types.ObjectId.isValid(authorId)) {
    errors.push("The author id is of a wrong type");
  }

  if (
    status &&
    status !== "published" &&
    status !== "draft" &&
    status !== "archived"
  ) {
    errors.push(
      "The status property has to be either published, draft or archived",
    );
  }

  if (tags !== undefined && !Array.isArray(tags)) {
    errors.push("The tags property must be an array");
  }

  if (categories !== undefined && !Array.isArray(categories)) {
    errors.push("The categories property must be an array");
  }

  return errors;
}

export function validateUpdate(input: updatePostInput): string[] {
  const { title, content, status, tags, categories } = input;
  const errors = [];

  if (title !== undefined && typeof title !== "string") {
    errors.push("The title property must be a string");
    return errors;
  }

  if (title !== undefined && !title.trim().length) {
    errors.push("The title property cannot be empty");
  }

  if (content !== undefined && typeof content !== "string") {
    errors.push("The content property must be a string");
    return errors;
  }

  if (content !== undefined && !content.trim().length) {
    errors.push("The content property is required");
  }

  if (
    status !== undefined &&
    status !== "published" &&
    status !== "draft" &&
    status !== "archived"
  ) {
    errors.push(
      "The status property has to be either published, draft or archived",
    );
  }

  if (tags !== undefined && !Array.isArray(tags)) {
    errors.push("The tags property must be an array");
  }

  if (categories !== undefined && !Array.isArray(categories)) {
    errors.push("The categories property must be an array");
  }

  return errors;
}

export function validateQuery(query: searchQuery): string[] {
  const { page, limit, search } = query;
  const errors = [];

  if (page && (Number.isNaN(parseInt(page)) || parseInt(page) <= 0)) {
    errors.push("The page must be a positive integer and bigger than 0");
  }
  if (limit && (Number.isNaN(parseInt(limit)) || parseInt(limit) <= 0)) {
    errors.push("The limit must be a positive integer and bigger than 0");
  }
  if (search !== undefined && !search.trim().length) {
    errors.push("The search cannot be an empty string");
  }

  return errors;
}

export function validateComment(input: Comment): string[] {
  const { text } = input;
  const errors = [];

  if (text && typeof text !== "string") {
    errors.push("The text property must be a string");
  }

  if (!text || !text.trim().length) {
    errors.push("The text property cannot be empty");
  }

  return errors;
}

export function validateId(id: any): string[] {
  const errors: string[] = [];

  if (!mongoose.Types.ObjectId.isValid(id)) {
    errors.push("The id is invalid");
  }
  return errors;
}

export function validateAuthorization(id: any): string[] {
  const errors: string[] = [];

  if (!mongoose.Types.ObjectId.isValid(id)) {
    errors.push("The authorId is invalid");
  }
  return errors;
}
