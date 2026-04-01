import { Router } from "express";
import {
  authMiddleware,
  orgMemberMiddleware,
  requireRole,
} from "../middlewares/auth.middleware.js";
import {
  createBoardController,
  deleteBoardByIdController,
  getAllBoardsController,
  getBoardByIdController,
  updateBoardByIdController,
} from "../controllers/index.js";

const boardRouter = Router();

boardRouter.use(authMiddleware);

boardRouter.get("/", orgMemberMiddleware, getAllBoardsController);
boardRouter.get("/:boardId", orgMemberMiddleware, getBoardByIdController);

boardRouter.post(
  "/",
  orgMemberMiddleware,
  requireRole("admin"),
  createBoardController
);
boardRouter.delete(
  "/:boardId",
  orgMemberMiddleware,
  requireRole("admin"),
  deleteBoardByIdController
);
boardRouter.patch(
  "/:boardId",
  orgMemberMiddleware,
  requireRole("admin"),
  updateBoardByIdController
);

export default boardRouter;
