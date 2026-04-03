import { Router } from "express";
import {
  createCardController,
  deleteCardByIdController,
  getAllCardsController,
  getCardByIdController,
  updateCardByIdController,
} from "../controllers/index.js";

const cardRouter = Router({ mergeParams: true });

cardRouter.post("/", createCardController);
cardRouter.get("/", getAllCardsController);
cardRouter.get("/:cardId", getCardByIdController);
cardRouter.patch("/:cardId", updateCardByIdController);
cardRouter.delete("/:cardId", deleteCardByIdController);

export default cardRouter;
