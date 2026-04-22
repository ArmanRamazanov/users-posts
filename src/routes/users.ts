import express from "express";
import {
  create,
  del,
  follow,
  getAll,
  getById,
  getFollowers,
  unfollow,
  update,
} from "../controllers/userController.js";
import { validateAndHandle } from "@/middleware/userValidation.js";
const usersRouter = express.Router();

usersRouter.get("/", validateAndHandle({ query: true }), getAll);
usersRouter.get("/:id", validateAndHandle({ idCheck: true }), getById);
usersRouter.get(
  "/:id/followers",
  validateAndHandle({ idCheck: true }),
  getFollowers,
);

usersRouter.post("/", validateAndHandle({ create: true }), create);
usersRouter.post("/:id/follow", validateAndHandle({ idCheck: true }), follow);
usersRouter.post(
  "/:id/unfollow",
  validateAndHandle({ idCheck: true }),
  unfollow,
);

usersRouter.patch(
  "/:id",
  validateAndHandle({ update: true, idCheck: true }),
  update,
);
usersRouter.delete("/:id", validateAndHandle({ idCheck: true }), del);
// 69e88441e1fe893351274ebe
// 69e88427e1fe893351274ebc
export default usersRouter;
