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
import listRouter from "./list.route.js";

const boardRouter = Router({ mergeParams: true });

boardRouter.use(orgMemberMiddleware);

boardRouter.use("/:boardId/lists", listRouter);

boardRouter.get("/", getAllBoardsController);
boardRouter.get("/:boardId", getBoardByIdController);

boardRouter.post("/", requireRole("admin"), createBoardController);
boardRouter.delete(
  "/:boardId",
  requireRole("admin"),
  deleteBoardByIdController,
);
boardRouter.patch("/:boardId", requireRole("admin"), updateBoardByIdController);

export default boardRouter;
