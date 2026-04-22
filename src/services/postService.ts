import type {
  PostDB,
  createPostInput,
  Comment,
  updatePostInput,
} from "@/types/post.types.js";
import type { searchQuery } from "@/types/general.types.js";
import db from "@/config/PostDatabase.js";
import mongoose from "mongoose";

export async function getPosts(query: searchQuery): Promise<{
  posts: PostDB[];
  meta: {
    totalPosts: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}> {
  const { page = "1", search = "", limit = "10" } = query;

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  const searchRegex = new RegExp(search, "i");

  const filter = {
    title: searchRegex,
  };

  const { posts, totalFilteredNumber } = await db.getPosts(
    filter,
    skip,
    limitNumber,
  );

  return {
    posts,
    meta: {
      totalPosts: totalFilteredNumber,
      totalPages: Math.ceil(totalFilteredNumber / limitNumber),
      currentPage: pageNumber,
      limit: limitNumber,
    },
  };
}

export async function getPost(postId: string) {
  return await db.getPostById(postId);
}

export async function createPost(input: createPostInput) {
  const { title, content, authorId, status, tags, categories } = input;

  const newPost: PostDB = {
    title: title,
    content: content,
    author: new mongoose.Types.ObjectId(authorId),
    status: status ?? "draft",
    tags: Array.isArray(tags) ? tags : [],
    categories: Array.isArray(categories) ? categories : [],
    comments: [],
    likes: [],
    views: 0,
    excerpt: "",
  };

  return await db.createPost(newPost);
}

export async function updatePost(
  authorId: string,
  postId: string,
  input: updatePostInput,
) {
  return await db.updatePost(authorId, postId, input);
}

export async function deletePost(authorId: string, postId: string) {
  return await db.deletePost(postId, authorId);
}

export async function addComment(postId: string, input: Comment) {
  const { text, authorId } = input;

  return await db.addComment(postId, text, authorId);
}

export async function toggleLike(postId: string, userId: string) {
  return await db.toggleLike(postId, userId);
}

export async function findPostsByAuthor(authorId: string) {
  return await db.getPostsByAuthor(authorId);
}

export async function findTrendingPosts() {
  return await db.getTrendingPosts();
}
