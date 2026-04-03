import { Router } from "express";
import {
  createListController,
  deleteListByIdController,
  getAllListsController,
  getListByIdController,
  updateListByIdController,
} from "../controllers/index.js";
import { requireRole } from "../middlewares/auth.middleware.js";
import cardRouter from "./card.route.js";
import { checkListExists } from "../middlewares/list.middleware.js";

const listRouter = Router({ mergeParams: true });

listRouter.post("/", requireRole("admin"), createListController);
listRouter.get("/", getAllListsController);
listRouter.get("/:listId", getListByIdController);
listRouter.delete("/:listId", requireRole("admin"), deleteListByIdController);
listRouter.patch("/:listId", requireRole("admin"), updateListByIdController);
listRouter.use(
  "/:listId/cards",
  requireRole("admin"),
  checkListExists,
  cardRouter,
);

export default listRouter;
