import Board from "../db/board.db.js";
import Org from "../db/org.db.js";

export const createBoardController = async (req, res) => {
  const { title, orgId } = req.body;
  try {
    const org = await Org.findById(orgId);
    if (!org) return res.status(404).json({ error: "Org not found" });
    const boards = await Board.findAll(orgId);
    if (boards.some((board) => board.title === title)) {
      return res
        .status(400)
        .json({ error: "Board with this title already exists" });
    }
    const board = await Board.create({ id: crypto.randomUUID(), title, orgId });
    return res
      .status(201)
      .json({ message: "Board created successfully", data: board });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create board" });
  }
};

export const getAllBoardsController = async (req, res) => {
  const { orgId } = req.query;
  if (!orgId) {
    return res.status(400).json({ error: "Missing orgId" });
  }
  try {
    const boards = await Board.findAll(orgId);
    return res
      .status(200)
      .json({ message: "Boards fetched successfully", data: boards });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch boards" });
  }
};

export const getBoardByIdController = async (req, res) => {
  const { boardId } = req.params;
  if (!boardId.trim())
    return res.status(400).json({ error: "Board id is required" });

  try {
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ error: "Board not found" });

    return res
      .status(200)
      .json({ message: "Board fetched successfully", data: board });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch board" });
  }
};

export const deleteBoardByIdController = async (req, res) => {
  const { boardId } = req.params;
  if (!boardId.trim())
    return res.status(400).json({ error: "Board id is required" });
  try {
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ error: "Board not found" });
    await Board.delete(boardId);
    return res
      .status(200)
      .json({ message: "Board deleted successfully", data: board });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete board" });
  }
};

export const updateBoardByIdController = async (req, res) => {
  const { boardId } = req.params;
  const { title } = req.body;
  if (!boardId.trim())
    return res.status(400).json({ error: "Board id is required" });
  try {
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ error: "Board not found" });
    const updated = await Board.update(boardId, { title });
    return res.status(200).json({
      message: "Board updated successfully",
      data: { ...board, title },
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update board" });
  }
};

// boards.json       → { id, title, orgId }
