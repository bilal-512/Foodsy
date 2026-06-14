import express from "express";
import { pool } from "../utils/db.js";

const router = express.Router();
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80";

router.get("/", async (req, res) => {
  const { category, search, restaurant } = req.query;
  const params = [DEFAULT_IMAGE];
  let sql = `SELECT mi.MenuItemID AS item_id,
                    mi.Name AS name,
                    COALESCE(mi.Description, '') AS description,
                    mi.BasePrice AS price,
                    c.Name AS category,
                    mi.IsAvailable AS is_available,
                    COALESCE(mi.ImgURL, ?) AS image_url,
                    r.RestaurantID AS restaurant_id,
                    r.Name AS restaurant_name
             FROM MenuItem mi
             JOIN Category c ON mi.CategoryID = c.CategoryID
             JOIN Restaurant r ON c.RestaurantID = r.RestaurantID
             WHERE mi.IsAvailable = 1`;

  if (category) {
    sql += " AND LOWER(c.Name) = LOWER(?)";
    params.push(category);
  }

  if (restaurant) {
    sql += " AND LOWER(r.Name) = LOWER(?)";
    params.push(restaurant);
  }

  if (search) {
    sql += " AND (LOWER(mi.Name) LIKE ? OR LOWER(mi.Description) LIKE ? OR LOWER(c.Name) LIKE ? OR LOWER(r.Name) LIKE ? )";
    const queryTerm = `%${search.toLowerCase()}%`;
    params.push(queryTerm, queryTerm, queryTerm, queryTerm);
  }

  sql += " ORDER BY c.DisplayOrder ASC, mi.Name ASC";
  const [rows] = await pool.query(sql, params);
  res.json(rows.map((item) => ({ ...item, image_url: item.image_url || DEFAULT_IMAGE })));
});

router.get("/categories", async (req, res) => {
  const [rows] = await pool.query(
    `SELECT CategoryID AS category_id, Name AS name, Description AS description,
            COALESCE(ImgURL, ?) AS image_url
     FROM Category
     WHERE IsActive = 1
     ORDER BY DisplayOrder ASC`,
    [DEFAULT_IMAGE]
  );
  res.json(rows.map((category) => ({ ...category, image_url: category.image_url || DEFAULT_IMAGE })));
});

router.get("/featured", async (req, res) => {
  const [rows] = await pool.query(
    `SELECT mi.MenuItemID AS item_id, mi.Name AS name, COALESCE(mi.Description, '') AS description,
            mi.BasePrice AS price, c.Name AS category, mi.IsAvailable AS is_available,
            COALESCE(mi.ImgURL, ?) AS image_url
     FROM MenuItem mi
     JOIN Category c ON mi.CategoryID = c.CategoryID
     WHERE mi.IsAvailable = 1
     ORDER BY mi.BasePrice DESC
     LIMIT 8`,
    [DEFAULT_IMAGE]
  );
  res.json(rows.map((item) => ({ ...item, image_url: item.image_url || DEFAULT_IMAGE })));
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query(
    `SELECT mi.MenuItemID AS item_id, mi.Name AS name, COALESCE(mi.Description, '') AS description,
            mi.BasePrice AS price, c.Name AS category, mi.IsAvailable AS is_available,
            COALESCE(mi.ImgURL, ?) AS image_url,
            r.RestaurantID AS restaurant_id, r.Name AS restaurant_name
     FROM MenuItem mi
     JOIN Category c ON mi.CategoryID = c.CategoryID
     JOIN Restaurant r ON c.RestaurantID = r.RestaurantID
     WHERE mi.MenuItemID = ?`,
    [DEFAULT_IMAGE, id]
  );

  if (!rows.length) return res.status(404).json({ message: "Menu item not found" });
  const item = rows[0];
  res.json({ ...item, image_url: item.image_url || DEFAULT_IMAGE });
});

router.post("/", async (req, res) => {
  const { name, description = "", price, category, image_url, is_available } = req.body;
  if (!name || !price || !category) return res.status(400).json({ message: "Missing required fields" });

  const [categoryRow] = await pool.query("SELECT CategoryID FROM Category WHERE LOWER(Name) = LOWER(?) LIMIT 1", [category]);
  let categoryId;
  if (!categoryRow.length) {
    const [catResult] = await pool.query(
      "INSERT INTO Category (CategoryID, RestaurantID, Name, Description, DisplayOrder, IsActive, ImgURL) VALUES (NULL, 1, ?, '', 1, 1, ?)",
      [category, DEFAULT_IMAGE]
    );
    categoryId = catResult.insertId;
  } else {
    categoryId = categoryRow[0].CategoryID;
  }

  const [result] = await pool.query(
    "INSERT INTO MenuItem (MenuItemID, CategoryID, Name, Description, BasePrice, IsAvailable, ImgURL) VALUES (NULL, ?, ?, ?, ?, ?, ?)",
    [categoryId, name, description, price, is_available ? 1 : 0, image_url || DEFAULT_IMAGE]
  );

  res.status(201).json({ item_id: result.insertId });
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description = "", price, category, image_url, is_available } = req.body;

  const [categoryRow] = await pool.query("SELECT CategoryID FROM Category WHERE LOWER(Name) = LOWER(?) LIMIT 1", [category]);
  let categoryId;
  if (!categoryRow.length) {
    const [catResult] = await pool.query(
      "INSERT INTO Category (CategoryID, RestaurantID, Name, Description, DisplayOrder, IsActive, ImgURL) VALUES (NULL, 1, ?, '', 1, 1, ?)",
      [category, DEFAULT_IMAGE]
    );
    categoryId = catResult.insertId;
  } else {
    categoryId = categoryRow[0].CategoryID;
  }

  await pool.query(
    "UPDATE MenuItem SET Name = ?, Description = ?, BasePrice = ?, IsAvailable = ?, CategoryID = ?, ImgURL = ? WHERE MenuItemID = ?",
    [name, description, price, is_available ? 1 : 0, categoryId, image_url || DEFAULT_IMAGE, id]
  );

  res.json({ message: "Updated" });
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM MenuItem WHERE MenuItemID = ?", [id]);
  res.json({ message: "Deleted" });
});

export default router;
