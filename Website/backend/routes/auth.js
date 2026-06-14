import express from "express";
import bcrypt from "bcryptjs";
import { pool } from "../utils/db.js";
import { signToken, authenticate } from "../utils/auth.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Missing email or password" });

  const [rows] = await pool.query("SELECT * FROM Person WHERE Email = ?", [email]);
  const user = rows[0];
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  let passwordMatches = false;
  if (user.Password?.startsWith("$2a$") || user.Password?.startsWith("$2b$") || user.Password?.startsWith("$2y$")) {
    passwordMatches = await bcrypt.compare(password, user.Password);
  } else {
    passwordMatches = password === user.Password;
    if (passwordMatches) {
      const hashed = await bcrypt.hash(password, 10);
      await pool.query("UPDATE Person SET Password = ? WHERE PersonID = ?", [hashed, user.PersonID]);
    }
  }

  if (!passwordMatches) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken(user);
  res.json({ token, user: { user_id: user.PersonID, name: user.Name, email: user.Email, role: user.Role.toLowerCase(), is_active: !!user.IsActive } });
});

router.get("/me", authenticate, async (req, res) => {
  const user = req.user;
  res.json({ user: { user_id: user.PersonID, name: user.Name, email: user.Email, role: user.Role.toLowerCase(), is_active: !!user.IsActive } });
});

router.patch("/me", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const { name, phone, email, password } = req.body;

    if (email) {
      const [existing] = await pool.query("SELECT * FROM Person WHERE Email = ? AND PersonID <> ?", [email.trim(), user.PersonID]);
      if (existing.length) return res.status(409).json({ message: "Email already in use" });
    }

    const updates = [];
    const params = [];
    if (name) { updates.push("Name = ?"); params.push(name.trim()); }
    if (phone) { updates.push("Phone = ?"); params.push(phone.trim()); }
    if (email) { updates.push("Email = ?"); params.push(email.trim()); }

    if (password) {
      const hashed = await bcrypt.hash(String(password), 10);
      updates.push("Password = ?");
      params.push(hashed);
    }

    if (updates.length) {
      params.push(user.PersonID);
      await pool.query(`UPDATE Person SET ${updates.join(', ')} WHERE PersonID = ?`, params);
    }

    const [rows] = await pool.query("SELECT * FROM Person WHERE PersonID = ?", [user.PersonID]);
    const updated = rows[0];
    const token = signToken(updated);
    res.json({ token, user: { user_id: updated.PersonID, name: updated.Name, email: updated.Email, role: updated.Role.toLowerCase(), is_active: !!updated.IsActive } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to update profile" });
  }
});

router.post("/register", async (req, res) => {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim();
  const password = req.body.password?.trim();
  if (!name || !email || !password) return res.status(400).json({ message: "Missing required fields" });

  const [existing] = await pool.query("SELECT * FROM Person WHERE Email = ?", [email]);
  if (existing.length) return res.status(409).json({ message: "Email already in use" });

  const hashed = await bcrypt.hash(password, 10);
  const [result] = await pool.query("INSERT INTO Person (PersonID, Name, Email, Phone, Password, Role, IsActive) VALUES (NULL, ?, ?, '', ?, 'Customer', 1)", [name, email, hashed]);
  const userId = result.insertId;
  await pool.query("INSERT INTO Customer (CustomerID, PersonID, WalletBalance, DefaultAddressID) VALUES (NULL, ?, 0, NULL)", [userId]);
  const [rows] = await pool.query("SELECT * FROM Person WHERE PersonID = ?", [userId]);
  const user = rows[0];
  const token = signToken(user);
  res.status(201).json({ token, user: { user_id: user.PersonID, name: user.Name, email: user.Email, role: user.Role.toLowerCase(), is_active: !!user.IsActive } });
});

router.post("/register/:role", async (req, res) => {
  const { role } = req.params;
  const name = req.body.name?.trim();
  const email = req.body.email?.trim();
  const password = req.body.password?.trim();
  if (!name || !email || !password) return res.status(400).json({ message: "Missing required fields" });

  const normalizedRole = String(role).toLowerCase();
  if (!["admin", "rider"].includes(normalizedRole)) {
    return res.status(400).json({ message: "Invalid registration role" });
  }

  const [existing] = await pool.query("SELECT * FROM Person WHERE Email = ?", [email]);
  if (existing.length) return res.status(409).json({ message: "Email already in use" });

  const hashed = await bcrypt.hash(password, 10);
  const roleName = normalizedRole === "admin" ? "Admin" : "Rider";
  const [result] = await pool.query("INSERT INTO Person (PersonID, Name, Email, Phone, Password, Role, IsActive) VALUES (NULL, ?, ?, '', ?, ?, 1)", [name, email, hashed, roleName]);
  const userId = result.insertId;

  if (normalizedRole === "admin") {
    await pool.query("INSERT INTO Admin (AdminID, PersonID, Permissions, LastLogin) VALUES (NULL, ?, '', NULL)", [userId]);
  } else {
    await pool.query("INSERT INTO Rider (RiderID, PersonID, AssignedAreaID, AdminID, VehicleType, Licence, IsAvailable, AvgRating) VALUES (NULL, ?, NULL, NULL, '', '', 1, 0)", [userId]);
  }

  const [rows] = await pool.query("SELECT * FROM Person WHERE PersonID = ?", [userId]);
  const user = rows[0];
  const token = signToken(user);
  res.status(201).json({ token, user: { user_id: user.PersonID, name: user.Name, email: user.Email, role: user.Role.toLowerCase(), is_active: !!user.IsActive } });
});

export default router;
