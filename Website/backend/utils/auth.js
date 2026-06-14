import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { pool } from "./db.js";

dotenv.config();

export const signToken = (user) => {
  return jwt.sign({ user_id: user.PersonID, role: user.Role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthorized" });

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.query("SELECT * FROM Person WHERE PersonID = ?", [payload.user_id]);
    if (!rows.length) return res.status(401).json({ message: "Unauthorized" });
    req.user = rows[0];
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Unauthorized" });
  }
};

export const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.Role.toLowerCase())) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};
