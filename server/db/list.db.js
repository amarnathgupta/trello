import { deleteData, insertData, readData, replaceData } from "./filedb.js";

const List = {
  create: async (data) => {
    await insertData("lists", data);
    return data;
  },
  findAll: async (boardId) => {
    const data = await readData("lists");
    return data.lists.filter((list) => list.boardId === boardId);
  },
  findById: async (id) => {
    const data = await readData("lists");
    return data.lists.find((list) => list.id === id);
  },
  update: async (id, newData) => {
    const data = await readData("lists");
    const updated = data.lists.map((list) =>
      list.id === id ? { ...list, ...newData } : list,
    );
    await replaceData("lists", updated);
  },
  delete: async (id) => {
    await deleteData("lists", id);
  },
};

export default List;
