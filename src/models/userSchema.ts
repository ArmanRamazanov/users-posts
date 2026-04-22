import mongoose from "mongoose";
import type {
  User,
  UserDocument,
  UserMethods,
  UserModelType,
} from "@/types/user.types.js";
import { Schema } from "mongoose";

const userSchema = new Schema<User, UserModelType, UserMethods>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [6, "Password must be at least 6 characters"],
      validate: {
        validator: function (value: string) {
          return /(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(value);
        },
        message:
          "Password must contain at least one lowercase, one uppercase, and one special character",
      },
    },
    profile: {
      type: {
        firstName: {
          type: String,
          trim: true,
          required: [true, "First name is required"],
        },
        lastName: {
          type: String,
          trim: true,
          minLength: 1,
        },
        bio: {
          type: String,
          minLength: 1,
        },
        followers: {
          type: [
            {
              type: Schema.Types.ObjectId,
              ref: "User",
            },
          ],
          default: [],
        },
        following: {
          type: [mongoose.Types.ObjectId],
          default: [],
        },
      },
      required: true,
    },
  },
  {
    methods: {
      getFollowersList(this: UserDocument) {
        return this.profile.followers;
      },
    },
  },
);

userSchema.virtual("fullName").get(function () {
  return `${this.profile.firstName} ${this.profile.lastName || ""}`.trim();
});

userSchema.virtual("followersCount").get(function () {
  return this.profile.followers.length;
});

userSchema.virtual("followingCount").get(function () {
  return this.profile.following.length;
});

export const UserModel = mongoose.model<User, UserModelType>(
  "User",
  userSchema,
);
