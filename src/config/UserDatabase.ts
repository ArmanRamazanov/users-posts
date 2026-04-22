import { UserModel } from "@/models/userSchema.js";
import type {
  UpdateUserInput,
  User,
  userWithoutPassword,
} from "@/types/user.types.js";
import bc from "bcryptjs";
import mongoose from "mongoose";
import { errorHandler } from "./databaseErrorHandler.js";

class UserDatabase {
  async getUsers(
    query = {},
    skip: number,
    limit: number,
  ): Promise<{ users: userWithoutPassword[]; totalFilteredNumber: number }> {
    try {
      const totalFilteredNumber = await UserModel.countDocuments(query);
      const users = await UserModel.find(query, { password: 0 })
        .skip(skip)
        .limit(limit);

      return { users, totalFilteredNumber };
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async getUserById(id: string): Promise<userWithoutPassword> {
    try {
      const user = await UserModel.findById(id);

      if (!user) {
        throw {
          status: 404,
          message: `User with ID ${id} not found`,
          isManualError: true,
        };
      }

      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async createUser(newUser: User): Promise<userWithoutPassword> {
    try {
      const user = await UserModel.create(newUser);
      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async updateUser(
    id: string,
    input: UpdateUserInput,
  ): Promise<userWithoutPassword> {
    const { username, newPassword, email, firstName, lastName, bio } = input;

    try {
      const user = await UserModel.findById(id);

      if (!user) {
        throw {
          status: 404,
          message: `User with ID ${id} not found`,
          isManualError: true,
        };
      }

      if (username !== undefined) {
        user.username = username.trim();
      }

      if (newPassword !== undefined) {
        user.password = await bc.hash(newPassword.trim(), 10);
      }

      if (email !== undefined) {
        user.email = email.trim();
      }

      if (firstName !== undefined) {
        user.profile.firstName = firstName;
      }

      if (lastName !== undefined) {
        user.profile.lastName = lastName;
      }

      if (bio !== undefined) {
        user.profile.bio = bio;
      }

      await user.save();

      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async getFollowersList(id: string): Promise<userWithoutPassword> {
    try {
      const user = await UserModel.findById(id);

      if (!user) {
        throw {
          status: 404,
          message: `User with ID ${id} not found`,
          isManualError: true,
        };
      }

      return user.populate("profile.followers", "username email");
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async follow(follower: string, followed: string): Promise<true> {
    try {
      const followed_user = await UserModel.findById(followed);
      const follower_user = await UserModel.findById(follower);

      if (follower === followed) {
        throw {
          status: 400,
          message: "Cannot follow yourself",
          isManualError: true,
        };
      }

      if (!follower_user) {
        throw {
          status: 404,
          message: `User with ID ${follower} not found`,
          isManualError: true,
        };
      }

      if (!followed_user) {
        throw {
          status: 404,
          message: `User with ID ${followed} not found`,
          isManualError: true,
        };
      }

      const followedObjectId = new mongoose.Types.ObjectId(followed);

      if (
        follower_user.profile.following.some((id) =>
          id.equals(followedObjectId),
        )
      ) {
        throw {
          status: 400,
          message: "Already following",
          isManualError: true,
        };
      }

      follower_user.profile.followers.push(
        new mongoose.Types.ObjectId(follower),
      );

      followed_user.profile.following.push(
        new mongoose.Types.ObjectId(followed),
      );

      await follower_user.save();
      await followed_user.save();
      return true;
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async unFollow(unfollower: string, unfollowed: string): Promise<true> {
    try {
      const unfollower_user = await UserModel.findById(unfollower);
      const unfollowed_user = await UserModel.findById(unfollowed);

      if (unfollower === unfollowed) {
        throw {
          status: 400,
          message: "Cannot unfollow yourself",
          isManualError: true,
        };
      }

      if (!unfollowed_user) {
        throw {
          status: 404,
          message: `User with ID ${unfollowed} not found`,
          isManualError: true,
        };
      }

      if (!unfollower_user) {
        throw {
          status: 404,
          message: `User with ID ${unfollower} not found`,
          isManualError: true,
        };
      }

      const unfollower_objectId = new mongoose.Types.ObjectId(unfollower);
      const unfollowed_objectId = new mongoose.Types.ObjectId(unfollowed);

      if (
        !unfollowed_user.profile.followers.some((id) =>
          id.equals(unfollower_objectId),
        )
      ) {
        throw {
          status: 400,
          message: "First need to be following",
          isManualError: true,
        };
      }

      unfollowed_user.profile.followers =
        unfollowed_user.profile.followers.filter(
          (followerId) => !followerId.equals(unfollower_objectId),
        );

      unfollower_user.profile.following =
        unfollower_user.profile.following.filter(
          (followingId) => !followingId.equals(unfollowed_objectId),
        );

      await unfollower_user.save();
      await unfollowed_user.save();
      return true;
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async deleteUser(userId: string): Promise<true> {
    try {
      const user = await UserModel.findById(userId);

      if (!user) {
        throw {
          status: 404,
          message: `User with ID ${userId} not found`,
          isManualError: true,
        };
      }

      await UserModel.deleteOne(new mongoose.Types.ObjectId(userId));
      return true;
    } catch (error) {
      throw errorHandler(error);
    }
  }
}

export default new UserDatabase();
