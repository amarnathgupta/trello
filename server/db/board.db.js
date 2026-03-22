import { deleteData, overwriteData, readData, writeData } from "./filedb.js";

const Board = {
  create: async (data) => {
    await writeData("boards", data);
    return data;
  },
  findAll: async (orgId) => {
    const data = await readData("boards");
    const boards = data.boards.filter((board) => board.orgId === orgId);
    return boards;
  },
  findById: async (id) => {
    const data = await readData("boards");
    return data.boards.find((board) => board.id === id);
  },
  findByOrgId: async (orgId) => {
    const data = await readData("boards");
    return data.boards.filter((board) => board.orgId === orgId);
  },
  update: async (id, newData) => {
    const data = await readData("boards");
    const updated = data.boards.map((board) =>
      board.id === id ? { ...board, ...newData } : board,
    );
    await overwriteData("boards", updated);
  },
  delete: async (id) => {
    await deleteData("boards", id);
  },
};

export default Board;

// boards.json       → { id, title, orgId }
