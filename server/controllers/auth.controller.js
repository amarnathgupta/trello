import User from "../db/user.db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signupController = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Missing username or password" });
  }

  try {
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      id: crypto.randomUUID(),
      username,
      password: hashedPassword,
      orgId: [],
    });
    res.status(201).json({
      message: "User created successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
};

export const signinController = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Missing username or password" });
  }

  try {
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const payload = {
      id: user.id,
      username: user.username,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 Day
    });

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ error: "Failed to login" });
  }
};

export const getMeController = async (req, res) => {
  try {
    // Assuming user is set in req.user by authentication middleware
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Optionally fetch fresh user info if needed
    // const user = await User.findById(req.user.id);
    // For now, return what's in req.user
    res.status(200).json({
      message: "User info fetched successfully",
      data: {
        id: req.user.id,
        username: req.user.username,
        orgId: req.user.orgId || [],
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user info" });
  }
};

export const logoutController = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logout successful" });
};
