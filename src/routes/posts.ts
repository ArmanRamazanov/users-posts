import express from "express";
import {
  getAll,
  getById,
  create,
  update,
  del,
  postComment,
  handleLike,
  getByAuthor,
  getTrending,
} from "../controllers/postController.js";
import { validateAndHandle } from "@/middleware/postValidation.js";
const postsRouter = express.Router();

postsRouter.get("/", validateAndHandle({ query: true }), getAll);
postsRouter.get("/trending", getTrending);
postsRouter.get("/:id", validateAndHandle({ idCheck: true }), getById);
postsRouter.get(
  "/author/:id",
  validateAndHandle({ idCheck: true }),
  getByAuthor,
);

postsRouter.post("/", validateAndHandle({ create: true }), create);
postsRouter.post(
  "/:id/comments",
  validateAndHandle({
    commentCheck: true,
    idCheck: true,
    authorizationIdCheck: true,
  }),
  postComment,
);
postsRouter.post(
  "/:id/likes",
  validateAndHandle({ idCheck: true, authorizationIdCheck: true }),
  handleLike,
);

postsRouter.patch(
  "/:id",
  validateAndHandle({
    update: true,
    authorizationIdCheck: true,
    idCheck: true,
  }),
  update,
);

postsRouter.delete(
  "/:id",
  validateAndHandle({ idCheck: true, authorizationIdCheck: true }),
  del,
);

export default postsRouter;
