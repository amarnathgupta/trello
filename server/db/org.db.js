import { deleteData, replaceData, readData, insertData } from "./filedb.js";

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
    await insertData("orgs", data);
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
    user.orgId = user.orgId ?? [];
    user.orgId.push(orgId);

    const updatedUsers = userData.users.map((u) =>
      u.id === userId ? user : u,
    );
    await replaceData("orgs", data.orgs);
    await replaceData("users", updatedUsers);
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
    user.orgId = (user.orgId ?? []).filter((o) => o !== orgId);

    const updatedUsers = userData.users.map((u) =>
      u.id === userId ? user : u,
    );
    await replaceData("orgs", data.orgs);
    await replaceData("users", updatedUsers);
  },
  findByUserId: async (userId) => {
    const userData = await readData("users");
    const user = userData.users.find((user) => user.id === userId);
    if (!user) throw new Error(`User ${userId} not found`);

    const orgData = await readData("orgs");
    const ids = user.orgId ?? [];
    const orgs = orgData.orgs.filter((org) => ids.includes(org.id));
    return orgs;
  },
  update: async (id, newData) => {
    const data = await readData("orgs");
    const idx = data.orgs.findIndex((org) => org.id === id);
    if (idx === -1) return null;
    const merged = { ...data.orgs[idx], ...newData };
    const updated = data.orgs.map((org) => (org.id === id ? merged : org));
    await replaceData("orgs", updated);
    return merged;
  },
  delete: async (id) => {
    await deleteData("orgs", id);
    const userData = await readData("users");
    const updatedUsers = userData.users.map((user) => ({
      ...user,
      orgId: (user.orgId ?? []).filter((o) => o !== id),
    }));
    await replaceData("users", updatedUsers);
  },
  findMembers: async (orgId) => {
    const data = await readData("orgs");
    const org = data.orgs.find((org) => org.id === orgId);
    if (!org) throw new Error(`Org ${orgId} not found`);

    const userData = await readData("users");

    const members = org.members.map((m) => {
      const user = userData.users.find((u) => u.id === m.userId);

      if (!user) {
        console.warn("User not found for member:", m.userId);
        return {
          userId: m.userId,
          username: "Unknown",
          role: m.role,
        };
      }

      return {
        userId: user.id,
        username: user.username,
        role: m.role,
      };
    });

    return { members };
  },
};

export default Org;

// orgs.json         → { id, name, description, type(public/private), members: [{userId, role}] }
