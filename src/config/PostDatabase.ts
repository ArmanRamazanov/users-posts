import type { PostDB, updatePostInput, CommentDB } from "@/types/post.types.js";
import { PostModel } from "@/models/postSchema.js";
import { errorHandler } from "@/config/databaseErrorHandler.js";
import mongoose from "mongoose";
import { UserModel } from "@/models/userSchema.js";

class PostDatabase {
  async getPosts(
    query = {},
    skip: number,
    limit: number,
  ): Promise<{ posts: PostDB[]; totalFilteredNumber: number }> {
    try {
      const totalFilteredNumber = await PostModel.countDocuments(query);
      const posts = await PostModel.find(query, { password: 0 })
        .skip(skip)
        .limit(limit);

      return { posts, totalFilteredNumber };
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async getPostById(postId: string): Promise<PostDB> {
    try {
      const post = await PostModel.findByIdAndUpdate(
        postId,
        { $inc: { views: 1 } },
        { new: true },
      );
      if (!post) {
        throw {
          status: 404,
          message: `Post with ID ${postId} not found`,
          isManualError: true,
        };
      }
      return post;
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async updatePost(
    authorId: string,
    postId: string,
    updateInput: updatePostInput,
  ): Promise<PostDB> {
    try {
      const post = await PostModel.findById(postId);
      const { title, content, status, tags, categories } = updateInput;

      if (!post) {
        throw {
          status: 404,
          message: `Post with ID ${postId} not found`,
          isManualError: true,
        };
      }

      if (!authorId) {
        throw {
          status: 401,
          message: "Author id was not provided",
          isManualError: true,
        };
      }

      if (
        !(
          mongoose.Types.ObjectId.isValid(authorId) &&
          String(new mongoose.Types.ObjectId(authorId)) === authorId
        )
      ) {
        throw {
          status: 400,
          message: "Invalid Id",
          isManualError: true,
        };
      }

      if (post.author.toString() !== authorId) {
        throw {
          status: 403,
          message: "The post can be updated by author only",
          isManualError: true,
        };
      }

      if (title !== undefined) {
        post.title = title;
      }

      if (content !== undefined) {
        post.content = content;
      }

      if (status !== undefined) {
        post.status = status;
      }

      if (tags !== undefined) {
        post.tags = tags;
      }

      if (categories !== undefined) {
        post.categories = categories;
      }

      if (status === "published") {
        post.publishedAt = new Date();
      }

      return await post.save();
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async createPost(newPost: PostDB): Promise<PostDB> {
    try {
      const post = await PostModel.create(newPost);
      post.excerpt = post.generateExcerpt();
      post.save();
      return post;
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async deletePost(postId: string, authorId: string): Promise<true> {
    try {
      const post = await PostModel.findById(postId);

      if (!post) {
        throw {
          status: 404,
          message: `Post with ID ${postId} not found`,
          isManualError: true,
        };
      }

      if (!authorId) {
        throw {
          status: 401,
          message: "Author id was not provided",
          isManualError: true,
        };
      }

      if (
        !(
          mongoose.Types.ObjectId.isValid(authorId) &&
          String(new mongoose.Types.ObjectId(authorId)) === authorId
        )
      ) {
        throw {
          status: 400,
          message: "Invalid Id",
          isManualError: true,
        };
      }

      if (post.author.toString() !== authorId) {
        throw {
          status: 403,
          message: "The post can be deleted by author only",
          isManualError: true,
        };
      }

      await PostModel.deleteOne(new mongoose.Types.ObjectId(postId));
      return true;
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async addComment(
    postId: string,
    text: string,
    authorId: string,
  ): Promise<PostDB> {
    try {
      const post = await PostModel.findById(postId);
      const user = await UserModel.findById(authorId);

      const authorObjectId = new mongoose.Types.ObjectId(authorId);

      if (!authorId) {
        throw {
          status: 400,
          message: "Author id was not provided",
        };
      }

      if (!post) {
        throw {
          status: 404,
          message: `Post with ID ${postId} not found`,
          isManualError: true,
        };
      }

      if (!user) {
        throw {
          status: 404,
          message: "The user does not exist",
          isManualError: true,
        };
      }

      const newComment: CommentDB = {
        text,
        author: authorObjectId,
      };

      post.comments.push(newComment);
      await post.save();

      return post;
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async toggleLike(postId: string, userId: string): Promise<PostDB> {
    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const user = UserModel.findById(userId);
      const post = await PostModel.findById(postId);

      if (!userId) {
        throw {
          status: 401,
          message: "Author id was not provided",
          isManualError: true,
        };
      }

      if (!user) {
        throw {
          status: 404,
          message: "The user does not exist",
          isManualError: true,
        };
      }

      if (!post) {
        throw {
          status: 404,
          message: "Post was not found",
          isManualError: true,
        };
      }

      post.toggleLike(userObjectId);
      await post.save();
      return post;
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async getPostsByAuthor(authorId: string): Promise<PostDB[]> {
    try {
      const authorObjectId = new mongoose.Types.ObjectId(authorId);
      return PostModel.findByAuthor(authorObjectId);
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async getTrendingPosts(): Promise<PostDB[]> {
    try {
      return PostModel.findPopular();
    } catch (error) {
      throw errorHandler(error);
    }
  }
}

export default new PostDatabase();
