import { Router } from "express";
import {
  getMeController,
  logoutController,
  signinController,
  signupController,
} from "../controllers/index.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const authRouter = Router();

authRouter.post("/signup", signupController);
authRouter.post("/signin", signinController);
authRouter.get("/me", authMiddleware, getMeController);
authRouter.post("/logout", authMiddleware, logoutController);

// users.json        → { id, username, password, orgId }
