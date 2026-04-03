import { Router } from "express";
import {
  authMiddleware,
  orgMemberMiddleware,
} from "../middlewares/auth.middleware.js";
import {
  createOrgController,
  getAllOrgsController,
  getOrgByIdController,
  deleteOrgByIdController,
  updateOrgByIdController,
  addMemberController,
  removeMemberController,
  getAllBoardsController,
} from "../controllers/index.js";
import boardRouter from "./board.route.js";

const orgRouter = Router();

orgRouter.use(authMiddleware);

orgRouter.use("/:orgId/boards", boardRouter);

orgRouter.post("/", createOrgController);
orgRouter.get("/", getAllOrgsController);
orgRouter.get("/:orgId", getOrgByIdController);
orgRouter.delete("/:orgId", deleteOrgByIdController);
orgRouter.patch("/:orgId", updateOrgByIdController);
orgRouter.post("/:orgId/members", addMemberController);
orgRouter.delete("/:orgId/members/:userId", removeMemberController);

export default orgRouter;
