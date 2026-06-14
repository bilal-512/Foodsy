import express from "express";
import { pool } from "../utils/db.js";
import { authenticate } from "../utils/auth.js";

const router = express.Router();
router.use(authenticate);

const getCustomerId = async (personId) => {
  const [customerRows] = await pool.query("SELECT CustomerID FROM Customer WHERE PersonID = ? LIMIT 1", [personId]);
  return customerRows[0]?.CustomerID || null;
};

router.get("/", async (req, res) => {
  const customerId = await getCustomerId(req.user.PersonID);
  if (!customerId) return res.status(404).json({ message: "Customer not found" });

  const [rows] = await pool.query(
    `SELECT ci.CartItemID AS item_id, mi.Name AS name, ci.Quantity AS quantity,
            ci.Price AS price, (ci.Quantity * ci.Price) AS subtotal
     FROM CartItem ci
     JOIN Cart c ON ci.CartID = c.CartID
     JOIN MenuItem mi ON ci.MenuItemID = mi.MenuItemID
     WHERE c.CustomerID = ?`,
    [customerId]
  );

  const total = rows.reduce((sum, item) => sum + item.subtotal, 0);
  res.json({ items: rows, total });
});

router.post("/", async (req, res) => {
  const { item_id, quantity } = req.body;
  if (!item_id || !quantity) return res.status(400).json({ message: "Missing item or quantity" });

  const customerId = await getCustomerId(req.user.PersonID);
  if (!customerId) return res.status(404).json({ message: "Customer not found" });

  const [cartRows] = await pool.query("SELECT CartID FROM Cart WHERE CustomerID = ? LIMIT 1", [customerId]);
  let cartId;
  if (!cartRows.length) {
    const [result] = await pool.query("INSERT INTO Cart (CartID, CustomerID, Status, CreatedAt, UpdatedAt) VALUES (NULL, ?, 'active', NOW(), NOW())", [customerId]);
    cartId = result.insertId;
  } else {
    cartId = cartRows[0].CartID;
  }

  const [existing] = await pool.query("SELECT * FROM CartItem WHERE CartID = ? AND MenuItemID = ?", [cartId, item_id]);
  if (existing.length) {
    await pool.query("UPDATE CartItem SET Quantity = Quantity + ? WHERE CartID = ? AND MenuItemID = ?", [quantity, cartId, item_id]);
  } else {
    const [menuRows] = await pool.query("SELECT BasePrice FROM MenuItem WHERE MenuItemID = ?", [item_id]);
    if (!menuRows.length) return res.status(404).json({ message: "Menu item not found" });
    await pool.query("INSERT INTO CartItem (CartItemID, CartID, MenuItemID, Quantity, Price) VALUES (NULL, ?, ?, ?, ?)", [cartId, item_id, quantity, menuRows[0].BasePrice]);
  }

  res.status(201).json({ message: "Added to cart" });
});

router.put("/:item_id", async (req, res) => {
  const { item_id } = req.params;
  const { quantity } = req.body;
  const customerId = await getCustomerId(req.user.PersonID);
  if (!customerId) return res.status(404).json({ message: "Customer not found" });

  const [cartRows] = await pool.query("SELECT CartID FROM Cart WHERE CustomerID = ? LIMIT 1", [customerId]);
  if (!cartRows.length) return res.status(404).json({ message: "Cart not found" });

  if (quantity < 1) {
    await pool.query("DELETE FROM CartItem WHERE CartID = ? AND MenuItemID = ?", [cartRows[0].CartID, item_id]);
    return res.json({ message: "Removed" });
  }

  await pool.query("UPDATE CartItem SET Quantity = ? WHERE CartID = ? AND MenuItemID = ?", [quantity, cartRows[0].CartID, item_id]);
  res.json({ message: "Updated" });
});

router.delete("/:item_id", async (req, res) => {
  const { item_id } = req.params;
  const customerId = await getCustomerId(req.user.PersonID);
  if (!customerId) return res.status(404).json({ message: "Customer not found" });

  const [cartRows] = await pool.query("SELECT CartID FROM Cart WHERE CustomerID = ? LIMIT 1", [customerId]);
  if (!cartRows.length) return res.status(404).json({ message: "Cart not found" });

  await pool.query("DELETE FROM CartItem WHERE CartID = ? AND MenuItemID = ?", [cartRows[0].CartID, item_id]);
  res.json({ message: "Deleted" });
});

export default router;
