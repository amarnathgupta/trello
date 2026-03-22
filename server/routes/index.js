import { Router } from "express";
import { authRouter } from "./auth.route.js";
import orgRouter from "./org.routes.js";
import boardRouter from "./board.route.js";

export const router = Router();

router.use("/auth", authRouter);
router.use("/orgs", orgRouter);
router.use("/boards", boardRouter);
