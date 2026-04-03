import organization from "../db/org.db.js";
import User from "../db/user.db.js";

export const createOrgController = async (req, res) => {
  const { name, description, type = "public" } = req.body;
  if (!name?.trim() || !description?.trim()) {
    return res.status(400).json({ error: "Missing name or description" });
  }

  try {
    const id = crypto.randomUUID();
    const data = {
      id,
      name,
      description,
      type,
      members: [{ userId: req.user.id, role: "admin" }],
    };

    const existingOrg = await organization.findByName(req.user.id, name);
    if (existingOrg.length > 0) {
      return res.status(400).json({ error: "Org name already exists" });
    }

    const user = await User.findById(req.user.id);
    const orgIdList = user.orgId ?? [];

    await User.update(req.user.id, { orgId: [...orgIdList, id] });

    const org = await organization.create(data);

    return res
      .status(201)
      .json({ message: "Org created successfully", data: org });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create org" });
  }
};

export const getAllOrgsController = async (req, res) => {
  try {
    const orgs = await organization.findByUserId(req.user.id);
    return res
      .status(200)
      .json({ message: "Orgs fetched successfully", data: orgs });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch orgs" });
  }
};

export const getOrgByIdController = async (req, res) => {
  const { orgId } = req.params;
  try {
    const org = await organization.findById(orgId);
    if (!org) return res.status(404).json({ error: "Org not found" });
    const isMember = org.members.some((m) => m.userId === req.user.id);
    if (!isMember) return res.status(403).json({ error: "don't have access" });

    return res
      .status(200)
      .json({ message: "Org fetched successfully", data: org });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch org" });
  }
};

export const deleteOrgByIdController = async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const { orgId } = req.params;
  try {
    const org = await organization.findById(orgId);
    if (!org) return res.status(404).json({ error: "Org not found" });

    const currentUser = org.members.find((m) => m.userId === req.user.id);
    if (!currentUser)
      return res.status(403).json({ error: "don't have access" });

    const isAdmin = currentUser.role === "admin";
    if (!isAdmin) return res.status(403).json({ error: "don't have access" });

    await organization.delete(orgId);
    return res
      .status(200)
      .json({ message: "Org deleted successfully", data: org });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete org" });
  }
};

export const updateOrgByIdController = async (req, res) => {
  const { orgId } = req.params;

  try {
    const org = await organization.findById(orgId);
    if (!org) return res.status(404).json({ error: "Org not found" });

    const currentUser = org.members.find((m) => m.userId === req.user.id);
    if (!currentUser)
      return res.status(403).json({ error: "don't have access" });

    const isAdmin = currentUser.role === "admin";
    if (!isAdmin) return res.status(403).json({ error: "don't have access" });

    const { id: _id, members: _members, ...safeData } = req.body;
    const updatedOrg = await organization.update(orgId, {
      ...org,
      ...safeData,
    });

    if (!updatedOrg) return res.status(404).json({ error: "Org not found" });

    return res
      .status(200)
      .json({ message: "Org updated successfully", data: updatedOrg });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update org" });
  }
};

export const addMemberController = async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const { orgId } = req.params;
  const { username, role } = req.body;
  if (!username?.trim() || role == null || String(role).trim() === "") {
    return res.status(400).json({ error: "Missing username or role" });
  }
  try {
    const org = await organization.findById(orgId);
    if (!org) return res.status(404).json({ error: "Org not found" });

    const currentUser = org.members.find((m) => m.userId === req.user.id);
    if (!currentUser)
      return res.status(403).json({ error: "don't have access" });

    const isAdmin = currentUser.role === "admin";
    if (!isAdmin) return res.status(403).json({ error: "don't have access" });

    const userToAdd = await User.findByUsername(username.trim());
    if (!userToAdd) {
      return res.status(404).json({ error: "User not found" });
    }

    await organization.addMember(orgId, userToAdd.id, role);
    const updatedOrg = await organization.findById(orgId);
    return res.status(200).json({
      message: "Member added successfully",
      data: updatedOrg,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to add member" });
  }
};

export const removeMemberController = async (req, res) => {
  const { orgId, userId } = req.params;
  if (!userId?.trim()) {
    return res.status(400).json({ error: "Missing userId" });
  }
  try {
    const org = await organization.findById(orgId);
    if (!org) return res.status(404).json({ error: "Org not found" });

    const currentUser = org.members.find((m) => m.userId === req.user.id);
    if (!currentUser)
      return res.status(403).json({ error: "don't have access" });

    const isAdmin = currentUser.role === "admin";
    if (!isAdmin) return res.status(403).json({ error: "don't have access" });

    await organization.removeMember(orgId, userId);
    return res.status(200).json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Error removing member: ", error.message);
    return res.status(500).json({ message: "Failed to remove member", error });
  }
};

// orgs.json         → { id, name, description, type(public/private), members: [{userId, role}] }
