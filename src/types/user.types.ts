import mongoose, { Document, Model } from "mongoose";

export interface User {
  username: string;
  email: string;
  password: string;
  profile: {
    firstName: string;
    lastName: string | null;
    bio: string | null;
    followers: mongoose.Types.ObjectId[];
    following: mongoose.Types.ObjectId[];
  };
}

export interface UserMethods {
  getFollowersList(): mongoose.Types.ObjectId[];
}

export type UserDocument = Document<unknown, {}, User> & User & UserMethods;

export type UserModelType = Model<User, {}, UserMethods> & {};

// export type User = Omit<UserDB, "profile"> & {
//   firstName: string;
//   lastName: string | null;
//   bio: string | null;
//   followers: string[];
//   following: string[];
// };

export type userWithoutPassword = Omit<User, "password">;

export type createUserInput = Omit<User, "profile"> & {
  firstName: string;
  lastName?: string;
  bio?: string;
};

export type UpdateUserInput = Partial<Omit<User, "profile" | "password">> & {
  firstName: string;
  lastName: string;
  bio: string;
  newPassword: string;
};
