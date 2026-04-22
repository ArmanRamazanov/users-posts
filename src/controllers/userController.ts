import type { userWithoutPassword } from "@/types/user.types.js";
import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "@/types/general.types.js";
import {
  createUser,
  deleteUser,
  followUser,
  getFollowersList,
  getUserById,
  getUsers,
  unfollowerUser,
  updateUser,
} from "@/services/userService.js";

export async function getAll(
  req: Request,
  res: Response<
    ApiResponse<{
      users: userWithoutPassword[];
      meta: {
        totalUsers: number;
        totalPages: number;
        currentPage: number;
        limit: number;
      };
    }>
  >,
  next: NextFunction,
) {
  try {
    const result = await getUsers(req.query);
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
  res: Response<ApiResponse<userWithoutPassword>>,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const result = await getUserById(id);
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
  res: Response<ApiResponse<userWithoutPassword>>,
  next: NextFunction,
) {
  try {
    const result = await createUser(req.body);
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
  res: Response<ApiResponse<userWithoutPassword>>,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const result = await updateUser(id, req.body);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function follow(
  req: Request<{ id: string }>,
  res: Response<ApiResponse<null>>,
  next: NextFunction,
) {
  try {
    const { followerId } = req.body;
    const { id } = req.params;
    const result = await followUser(followerId, id);
    if (result) {
      res.json({
        success: true,
      });
    }
  } catch (error) {
    next(error);
  }
}

export async function unfollow(
  req: Request<{ id: string }>,
  res: Response<ApiResponse<null>>,
  next: NextFunction,
) {
  try {
    const { unFollowerId } = req.body;
    const { id } = req.params;
    const result = await unfollowerUser(unFollowerId, id);
    if (result) {
      res.json({
        success: true,
      });
    }
  } catch (error) {
    next(error);
  }
}

export async function getFollowers(
  req: Request<{ id: string }>,
  res: Response<ApiResponse<userWithoutPassword>>,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const result = await getFollowersList(id);
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
    const result = await deleteUser(id);
    if (result) {
      res.status(204);
    }
  } catch (error) {
    next(error);
  }
}
