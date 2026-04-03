import { Router } from "express";
import {
  createListController,
  deleteListByIdController,
  getAllListsController,
  getListByIdController,
  updateListByIdController,
} from "../controllers/index.js";
import {
  authMiddleware,
  orgMemberMiddleware,
  requireRole,
} from "../middlewares/auth.middleware.js";

const listRouter = Router({ mergeParams: true });

// listRouter.use(authMiddleware, orgMemberMiddleware);

listRouter.post("/", requireRole("admin"), createListController);
listRouter.get("/", getAllListsController);
listRouter.get("/:listId", getListByIdController);
listRouter.delete("/:listId", requireRole("admin"), deleteListByIdController);
listRouter.patch("/:listId", requireRole("admin"), updateListByIdController);

export default listRouter;
