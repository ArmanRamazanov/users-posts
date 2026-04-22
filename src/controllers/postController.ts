import {
  getPost,
  getPosts,
  createPost,
  updatePost,
  deletePost,
  addComment,
  toggleLike,
  findPostsByAuthor,
  findTrendingPosts,
} from "@/services/postService.js";
import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "@/types/general.types.js";
import type { Post, PostDB } from "@/types/post.types.js";

export async function getAll(
  req: Request,
  res: Response<
    ApiResponse<{
      posts: PostDB[];
      meta: {
        totalPosts: number;
        totalPages: number;
        currentPage: number;
        limit: number;
      };
    }>
  >,
  next: NextFunction,
) {
  try {
    const result = await getPosts(req.query);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getById(
  req: Request<{ id: string }>,
  res: Response<ApiResponse<PostDB>>,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    const result = await getPost(id);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function create(
  req: Request,
  res: Response<ApiResponse<PostDB>>,
  next: NextFunction,
) {
  try {
    const result = await createPost(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function update(
  req: Request<{ id: string }>,
  res: Response<ApiResponse<PostDB>>,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const { authorId } = req.body;
    const { title, content, status, tags, categories } = req.body;

    if (
      title === undefined &&
      content === undefined &&
      status === undefined &&
      tags === undefined &&
      categories === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "No field was provided",
      });
    }

    const result = await updatePost(authorId, id, req.body);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function del(
  req: Request<{ id: string }>,
  res: Response<ApiResponse<null>>,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const { authorId } = req.body;
    const result = await deletePost(authorId, id);
    if (result) {
      res.sendStatus(204);
    }
  } catch (error) {
    next(error);
  }
}

export async function postComment(
  req: Request<{ id: string }>,
  res: Response<ApiResponse<PostDB>>,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const result = await addComment(id, req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleLike(
  req: Request<{ id: string }>,
  res: Response<ApiResponse<PostDB>>,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const { authorId } = req.body;
    const result = await toggleLike(id, authorId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getByAuthor(
  req: Request<{ id: string }>,
  res: Response<ApiResponse<PostDB[]>>,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const result = await findPostsByAuthor(id);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTrending(
  req: Request,
  res: Response<ApiResponse<PostDB[]>>,
  next: NextFunction,
) {
  try {
    console.log("reached to getTrending");
    const result = await findTrendingPosts();
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
