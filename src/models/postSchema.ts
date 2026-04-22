import mongoose from "mongoose";
import { postStatus } from "@/types/post.types.js";
import { Schema } from "mongoose";
import type {
  PostDocument,
  PostModelType,
  PostDB,
  PostMethods,
} from "@/types/post.types.js";

const commentSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Comment author is required"],
  },
});

const postSchema = new Schema<PostDB, PostModelType, PostMethods>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
    author: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    status: {
      type: String,
      enum: Object.values(postStatus),
      default: postStatus.Draft,
    },
    comments: {
      type: [commentSchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    categories: {
      type: [String],
      default: [],
    },
    likes: {
      type: [{ type: mongoose.Types.ObjectId, ref: "User" }],
      default: [],
    },
    views: {
      type: Number,
      default: 0,
    },
    excerpt: String,
    publishedAt: Date,
  },
  {
    timestamps: true,
    methods: {
      generateExcerpt(this: PostDocument, length = 150) {
        return this.content.substring(0, length) + "...";
      },
      addComment(commentText: string, authorId: mongoose.Types.ObjectId) {
        this.comments.push({
          text: commentText,
          author: authorId,
        });
      },
      toggleLike(userId: mongoose.Types.ObjectId) {
        if (this.likes.some((id) => id.equals(userId))) {
          return (this.likes = this.likes.filter(
            (user: mongoose.Types.ObjectId) => !user.equals(userId),
          ));
        }
        return this.likes.push(userId);
      },
    },
    statics: {
      findPopular() {
        return this.where({ $expr: { $gt: [{ $size: "$likes" }, 50] } });
      },
      findByAuthor(authorId: mongoose.Types.ObjectId) {
        return this.where({ author: authorId });
      },
    },
  },
);

postSchema.virtual("likesCount").get(function () {
  return this.likes.length;
});

postSchema.virtual("commentsCount").get(function () {
  return this.comments.length;
});

postSchema.virtual("readingTime").get(function () {
  return `${Math.ceil(this.content.length / 250)} minutes`;
});

postSchema.pre("save", function () {
  if (this.isModified("content")) {
    this.excerpt = this.content.substring(0, 150) + "...";
  }
  if (this.isModified("status") && this.status === "published") {
    this.publishedAt = new Date();
  }
});

export const PostModel = mongoose.model<PostDB, PostModelType>(
  "Post",
  postSchema,
);
