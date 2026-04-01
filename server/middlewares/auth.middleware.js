import jwt from "jsonwebtoken";
import organization from "../db/org.db.js";

export async function authMiddleware(req, res, next) {
  const token = req.cookies.token;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

export async function orgMemberMiddleware(req, res, next) {
  const orgId = req.params?.orgId || req.body?.orgId || req.query?.orgId;
  if (!orgId) {
    return res.status(400).json({ error: "Missing orgId" });
  }

  const { id: userId } = req.user;

  try {
    const org = await organization.findById(orgId);
    if (!org) return res.status(404).json({ error: "Org not found" });

    const isMember = org.members.find((m) => m.userId === userId);
    if (!isMember) return res.status(403).json({ error: "don't have access" });

    req.user.role = isMember.role;

    next();
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch org" });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role)
      return res.status(403).json({ error: "don't have access" });
    next();
  };
}
