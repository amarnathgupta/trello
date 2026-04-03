import { deleteData, insertData, readData, replaceData } from "./filedb.js";

const Card = {
  create: async (data) => {
    await insertData("cards", data);
    return data;
  },
  findAll: async (listId) => {
    const data = await readData("cards");
    return data.cards.filter((card) => card.listId === listId);
  },
  findById: async (id) => {
    const data = await readData("cards");
    return data.cards.find((card) => card.id === id);
  },
  update: async (id, newData) => {
    const data = await readData("cards");
    const updated = data.cards.map((card) =>
      card.id === id ? { ...card, ...newData } : card,
    );
    await replaceData("cards", updated);
  },
  delete: async (id) => {
    await deleteData("cards", id);
  },
};

export default Card;

// cards.json → { id, title, description, listId, createdAt }
