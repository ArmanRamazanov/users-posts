import type {
  createUserInput,
  User,
  userWithoutPassword,
  UpdateUserInput,
} from "@/types/user.types.js";
import type { searchQuery } from "@/types/general.types.js";
import db from "@/config/UserDatabase.js";
import bc from "bcryptjs";

export async function createUser(
  input: createUserInput,
): Promise<userWithoutPassword> {
  const { username, email, password, firstName, lastName, bio } = input;

  const hashedPassword = await bc.hash(password.trim(), 10);

  const newUser: User = {
    username: username.trim(),
    email: email.trim(),
    password: hashedPassword,
    profile: {
      firstName: firstName,
      lastName: lastName ?? null,
      bio: bio ?? null,
      followers: [],
      following: [],
    },
  };

  return await db.createUser(newUser);
}

export async function getUsers(query: searchQuery): Promise<{
  users: userWithoutPassword[];
  meta: {
    totalUsers: number;
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
    username: searchRegex,
  };

  const { users, totalFilteredNumber } = await db.getUsers(
    filter,
    skip,
    limitNumber,
  );

  return {
    users,
    meta: {
      totalUsers: totalFilteredNumber,
      totalPages: Math.ceil(totalFilteredNumber / limitNumber),
      currentPage: pageNumber,
      limit: limitNumber,
    },
  };
}

export async function getUserById(userId: string) {
  return await db.getUserById(userId);
}

export async function updateUser(
  userId: string,
  updateInput: UpdateUserInput,
): Promise<userWithoutPassword> {
  return await db.updateUser(userId, updateInput);
}

export async function followUser(
  follower: string,
  followed: string,
): Promise<true> {
  return await db.follow(follower, followed);
}

export async function unfollowerUser(
  unfollower: string,
  unfollowed: string,
): Promise<true> {
  return await db.unFollow(unfollower, unfollowed);
}

export async function getFollowersList(
  userId: string,
): Promise<userWithoutPassword> {
  return await db.getFollowersList(userId);
}

export async function deleteUser(userId: string) {
  return await db.deleteUser(userId);
}
