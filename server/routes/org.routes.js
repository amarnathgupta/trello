import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createOrgController,
  getAllOrgsController,
  getOrgByIdController,
  deleteOrgByIdController,
  updateOrgByIdController,
  addMemberController,
  removeMemberController,
} from "../controllers/index.js";

const orgRouter = Router();

orgRouter.use(authMiddleware);

orgRouter.post("/", createOrgController);
orgRouter.get("/", getAllOrgsController);
orgRouter.get("/:orgId", getOrgByIdController);
orgRouter.delete("/:orgId", deleteOrgByIdController);
orgRouter.patch("/:orgId", updateOrgByIdController);
orgRouter.post("/:orgId/members", addMemberController);
orgRouter.delete("/:orgId/members/:userId", removeMemberController);

export default orgRouter;
