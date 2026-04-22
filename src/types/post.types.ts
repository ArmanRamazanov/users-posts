import mongoose, { Document, Model } from "mongoose";

export enum postStatus {
  Draft = "draft",
  Published = "published",
  Archived = "archived",
}

export type PostDocument = Document<unknown, {}, PostDB> & PostDB & PostMethods;

export interface PostMethods {
  toggleLike(authorId: mongoose.Types.ObjectId): void;
  generateExcerpt(length?: number): string;
  addComment(commentText: string, authorId: mongoose.Types.ObjectId): void;
}

export type PostModelType = Model<PostDB, {}, PostMethods> & PostStatics;

export interface PostStatics {
  findPopular(): PostDocument[];
  findByAuthor(authorId: mongoose.Types.ObjectId): PostDocument[];
}

export interface CommentDB {
  text: string;
  author: mongoose.Types.ObjectId;
}

export type Comment = Omit<CommentDB, "author"> & {
  authorId: string;
};

export interface PostDB {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  status: postStatus;
  comments: CommentDB[];
  tags: string[];
  categories: string[];
  likes: mongoose.Types.ObjectId[];
  views: number;
  excerpt: string;
  publishedAt?: Date;
}

export type Post = Omit<PostDB, "author" | "likes"> & {
  authorId: string;
  likes: string[];
};

export type createPostInput = Omit<
  Post,
  "comments" | "likes" | "excerpt" | "publishedAt" | "views"
>;

export type updatePostInput = Omit<
  Post,
  "comments" | "author" | "comments" | "likes" | "excerpt" | "publishedAt"
>;
