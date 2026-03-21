import { deleteData, overwriteData, readData, writeData } from "./filedb.js";

const Org = {
  findById: async (id) => {
    const data = await readData("orgs");
    return data.orgs.find((org) => org.id === id);
  },
  findAll: async () => {
    const data = await readData("orgs");
    return data.orgs;
  },
  findByName: async (userId, name) => {
    const data = await readData("orgs");
    return data.orgs.filter(
      (org) =>
        org.name === name && org.members.some((m) => m.userId === userId),
    );
  },
  create: async (data) => {
    await writeData("orgs", data);
    return data;
  },

  addMember: async (orgId, userId, role) => {
    const data = await readData("orgs");
    const org = data.orgs.find((org) => org.id === orgId);
    if (!org) throw new Error(`Org ${orgId} not found`);

    const userData = await readData("users");
    const user = userData.users.find((user) => user.id === userId);
    if (!user) throw new Error(`User ${userId} not found`);

    if (org.members.some((m) => m.userId === userId)) {
      throw new Error(`User ${userId} is already a member`);
    }

    org.members.push({ userId, role });
    user.orgId.push(orgId);

    const updatedUsers = userData.users.map((u) =>
      u.id === userId ? user : u,
    );
    await overwriteData("orgs", data.orgs);
    await overwriteData("users", updatedUsers);
  },
  removeMember: async (orgId, userId) => {
    const data = await readData("orgs");
    const org = data.orgs.find((org) => org.id === orgId);
    if (!org) throw new Error(`Org ${orgId} not found`);

    const admins = org.members.filter((m) => m.role === "admin");
    const isAdmin =
      org.members.find((m) => m.userId === userId)?.role === "admin";
    if (isAdmin && admins.length === 1)
      throw new Error("Cannot remove the last admin");

    const userData = await readData("users");
    const user = userData.users.find((user) => user.id === userId);
    if (!user) throw new Error(`User ${userId} not found`);

    if (!org.members.some((m) => m.userId === userId)) {
      throw new Error(`User ${userId} is not a member`);
    }

    org.members = org.members.filter((m) => m.userId !== userId);
    user.orgId = user.orgId.filter((o) => o !== orgId);

    const updatedUsers = userData.users.map((u) =>
      u.id === userId ? user : u,
    );
    await overwriteData("orgs", data.orgs);
    await overwriteData("users", updatedUsers);
  },
  findByUserId: async (userId) => {
    const userData = await readData("users");
    const user = userData.users.find((user) => user.id === userId);
    if (!user) throw new Error(`User ${userId} not found`);

    const orgData = await readData("orgs");
    const orgs = orgData.orgs.filter((org) => user.orgId.includes(org.id));
    return orgs;
  },
  update: async (id, newData) => {
    const data = await readData("orgs");
    const updated = data.orgs.map((org) =>
      org.id === id ? { ...org, ...newData } : org,
    );
    await overwriteData("orgs", updated);
    return updated;
  },
  delete: async (id) => {
    await deleteData("orgs", id);
    const userData = await readData("users");
    const updatedUsers = userData.users.map((user) => ({
      ...user,
      orgId: user.orgId.filter((o) => o !== id),
    }));
    await overwriteData("users", updatedUsers);
  },
};

export default Org;

// orgs.json         → { id, name, description, type(public/private), members: [{userId, role}] }
