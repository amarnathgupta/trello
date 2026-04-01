import { deleteData, replaceData, readData, insertData } from "./filedb.js";

const User = {
  findById: async (id) => {
    const data = await readData("users");
    return data.users.find((user) => user.id === id);
  },
  findByUsername: async (username) => {
    const data = await readData("users");
    return data.users.find((user) => user.username === username);
  },
  findAll: async () => {
    return await readData("users");
  },
  create: async (data) => {
    await insertData("users", data);
    return data;
  },
  delete: async (id) => {
    await deleteData("users", id);
  },
  update: async (id, newData) => {
    const data = await readData("users");
    const updated = data.users.map((user) =>
      user.id === id ? { ...user, ...newData } : user,
    );
    await replaceData("users", updated);
  },
};

export default User;
