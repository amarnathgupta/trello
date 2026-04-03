import Board from "../db/board.db.js";
import List from "../db/list.db.js";

export const createListController = async (req, res) => {
  const { title } = req.body;
  const { boardId } = req.params;
  try {
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ error: "Board not found" });

    const lists = await List.findAll(boardId);
    if (lists.some((list) => list.title === title)) {
      return res
        .status(400)
        .json({ error: "List with this title already exists" });
    }
    const order = lists.length > 0 ? lists[lists.length - 1].order + 1 : 0;

    if (!title?.trim())
      return res.status(400).json({ error: "Title is required" });

    const list = await List.create({
      id: crypto.randomUUID(),
      title,
      boardId,
      order,
    });
    return res
      .status(201)
      .json({ message: "List created successfully", data: list });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create list" });
  }
};

export const getAllListsController = async (req, res) => {
  const { boardId } = req.params;
  try {
    const lists = await List.findAll(boardId);
    if (lists.length === 0) return res.status(200).json({ data: [] });

    const sortedLists = lists.sort((a, b) => a.order - b.order);

    return res.status(200).json({ data: sortedLists });
  } catch (error) {
    return res.status(500).json({ error: "Failed to get lists" });
  }
};

export const getListByIdController = async (req, res) => {
  const { listId } = req.params;
  try {
    const list = await List.findById(listId);
    return res.status(200).json({ data: list });
  } catch (error) {
    return res.status(500).json({ error: "Failed to get list" });
  }
};

export const deleteListByIdController = async (req, res) => {
  const { listId } = req.params;
  try {
    await List.delete(listId);
    return res.status(200).json({ message: "List deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete list" });
  }
};

export const updateListByIdController = async (req, res) => {
  const { listId } = req.params;
  const { title, order } = req.body;
  try {
    await List.update(listId, { title, order });
    return res.status(200).json({ message: "List updated successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update list" });
  }
};
