import type { searchQuery } from "@/types/general.types.js";
import type { createUserInput, UpdateUserInput } from "@/types/user.types.js";
import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

function validateEmail(email: string) {
  if (typeof email !== "string") return false;
  if (email.length > 254) return false;

  const [local, domain, ...extra] = email.split("@");
  if (extra.length > 0 || !local || !domain) return false;
  if (local.length > 64) return false;

  const domainParts = domain.split(".");
  if (domainParts.length < 2) return false;
  if (domainParts.some((part) => part.length === 0)) return false;

  const localValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local);
  const domainValid = /^[a-zA-Z0-9-]+$/.test(domainParts.join(""));
  const tldValid = /^[a-zA-Z]{2,}$/.test(domainParts[domainParts.length - 1]!);

  return localValid && domainValid && tldValid;
}

function validatePassword(password: string) {
  if (password.length < 6)
    return "The password must contain at least 6 characters";
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(password)) {
    return "The password property must contain at least one lowercase, one uppercase, and one special character";
  }
  return false;
}

export function validateAndHandle(validators: {
  create?: boolean;
  update?: boolean;
  query?: boolean;
  idCheck?: boolean;
  authorizationIdCheck?: boolean;
}): (req: Request, res: Response, next: () => void) => void {
  return function (req: Request, res: Response, next: NextFunction) {
    const errors: string[] = [];
    const { create, update, query, idCheck, authorizationIdCheck } = validators;

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

function validateQuery(query: searchQuery) {
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

function validateCreate(input: createUserInput): string[] {
  const { username, email, password, firstName, lastName, bio } = input;
  const errors = [];

  if (username !== undefined && typeof username !== "string") {
    errors.push("The username property must be string");
    return errors;
  }

  if (!username || !username.trim().length) {
    errors.push("The username property is required");
    return errors;
  }

  if (!email || !email.trim().length) {
    errors.push("The email property is required");
    return errors;
  }

  if (!validateEmail(email)) {
    errors.push("The email property is invalid");
  }

  if (!password || !password.trim().length) {
    errors.push("The password property is required");
    return errors;
  }

  const result = validatePassword(password);

  if (result) {
    errors.push(result);
  }

  if (!firstName || !firstName.trim().length) {
    errors.push("The firstName property is required");
    return errors;
  }

  if (firstName !== undefined && typeof firstName !== "string") {
    errors.push("The firstName property must be string");
  }

  if (lastName !== undefined && !lastName.trim().length) {
    errors.push("The lastName property cannot be empty");
  }

  if (lastName !== undefined && typeof lastName !== "string") {
    errors.push("The lastName property must be string");
  }

  if (bio !== undefined && !bio.trim().length) {
    errors.push("The property bio cannot be empty");
  }

  if (bio !== undefined && typeof bio !== "string") {
    errors.push("The property bio must be string");
  }
  return errors;
}

function validateUpdate(input: UpdateUserInput): string[] {
  const { username, email, newPassword, firstName, lastName, bio } = input;
  const errors = [];

  if (username !== undefined && typeof username !== "string") {
    errors.push("The username property must be a string");
    return errors;
  }

  if (username !== undefined && !username.trim().length) {
    errors.push("The username property cannot be empty");
  }

  if (email !== undefined && typeof email !== "string") {
    errors.push("The email property must be a string");
    return errors;
  }

  if (email !== undefined && !email.trim().length) {
    errors.push("The email property is required");
  }

  if (newPassword !== undefined && !validateEmail(newPassword)) {
    errors.push("The password property is invalid");
  }

  if (newPassword !== undefined && !newPassword.trim().length) {
    errors.push("The password property cannot be empty");
  }

  if (firstName !== undefined && !firstName.trim().length) {
    errors.push("The firstName property cannot be empty");
  }

  if (firstName !== undefined && typeof firstName !== "string") {
    errors.push("The firstName property must be string");
  }

  if (lastName !== undefined && !lastName.trim().length) {
    errors.push("The lastName property cannot be empty");
  }

  if (lastName !== undefined && typeof lastName !== "string") {
    errors.push("The lastName property must be string");
  }

  if (bio !== undefined && !bio.trim().length) {
    errors.push("The property bio cannot be empty");
  }

  if (bio !== undefined && typeof bio !== "string") {
    errors.push("The property bio must be string");
  }

  return errors;
}

function validateId(id: any): string[] {
  const errors = [];

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
