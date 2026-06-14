import express from "express";
import { pool } from "../utils/db.js";
import { authenticate, authorize } from "../utils/auth.js";

const router = express.Router();
router.use(authenticate);
router.use(authorize(["admin"]));

router.get("/employees", async (req, res) => {
  const [rows] = await pool.query(
    `SELECT e.EmployeeID AS user_id, p.Name AS full_name, p.Email AS email,
            'employee' AS role, COALESCE(e.Department, '') AS area
     FROM Employee e
     JOIN Person p ON e.PersonID = p.PersonID
     WHERE p.IsActive = 1
     UNION ALL
     SELECT r.RiderID AS user_id, p.Name AS full_name, p.Email AS email,
            'rider' AS role, COALESCE(a.AreaName, '') AS area
     FROM Rider r
     JOIN Person p ON r.PersonID = p.PersonID
     LEFT JOIN Area a ON r.AssignedAreaID = a.AreaID
     WHERE p.IsActive = 1
     ORDER BY role DESC, full_name`
  );
  res.json(rows);
});

router.post("/employees", async (req, res) => {
  const { name, email, role, area } = req.body;
  if (!name || !email || !role) return res.status(400).json({ message: "Missing required fields" });

  const normalizedRole = String(role).toLowerCase();
  if (!["employee", "rider"].includes(normalizedRole)) {
    return res.status(400).json({ message: "Invalid employee role" });
  }

  const [existing] = await pool.query("SELECT * FROM Person WHERE Email = ?", [email]);
  if (existing.length) return res.status(409).json({ message: "Email already in use" });

  const [personResult] = await pool.query(
    "INSERT INTO Person (PersonID, Name, Email, Phone, Password, Role, IsActive) VALUES (NULL, ?, ?, '', ?, ?, 1)",
    [name.trim(), email.trim(), '', normalizedRole === "rider" ? "Rider" : "Employee"]
  );
  const personId = personResult.insertId;

  let areaId = null;
  if (area?.trim()) {
    const [areaRows] = await pool.query("SELECT AreaID FROM Area WHERE LOWER(AreaName) = LOWER(?) LIMIT 1", [area.trim()]);
    if (areaRows.length) {
      areaId = areaRows[0].AreaID;
    } else {
      const [areaResult] = await pool.query(
        "INSERT INTO Area (AreaID, AreaName, LatCoordinate, LngCoordinate) VALUES (NULL, ?, 0, 0)",
        [area.trim()]
      );
      areaId = areaResult.insertId;
    }
  }

  if (normalizedRole === "rider") {
    const [riderResult] = await pool.query(
      "INSERT INTO Rider (RiderID, PersonID, AssignedAreaID, AdminID, VehicleType, Licence, IsAvailable, AvgRating) VALUES (NULL, ?, ?, NULL, '', '', 1, 0)",
      [personId, areaId]
    );
    const riderId = riderResult.insertId;
    // insert employee address if provided
    if (req.body.address && req.body.address.trim()) {
      await pool.query(
        "INSERT INTO Address (AddressID, CustomerID, EmployeeID, AreaID, Label, Street, City) VALUES (NULL, NULL, ?, ?, 'Home', ?, '')",
        [riderId, areaId, req.body.address.trim()]
      );
    }
  } else {
    const [empResult] = await pool.query(
      "INSERT INTO Employee (EmployeeID, PersonID, AdminID, JobTitle, Department, HireDate, IsActive) VALUES (NULL, ?, NULL, '', ?, CURDATE(), 1)",
      [personId, area?.trim() || '']
    );
    // empResult.insertId may be 0 depending on SQL mode; fetch by PersonID
    let employeeId = empResult.insertId;
    if (!employeeId) {
      const [q] = await pool.query("SELECT EmployeeID FROM Employee WHERE PersonID = ? LIMIT 1", [personId]);
      if (q.length) employeeId = q[0].EmployeeID;
    }
    if (req.body.address && req.body.address.trim() && employeeId) {
      await pool.query(
        "INSERT INTO Address (AddressID, CustomerID, EmployeeID, AreaID, Label, Street, City) VALUES (NULL, NULL, ?, ?, 'Home', ?, '')",
        [employeeId, areaId, req.body.address.trim()]
      );
    }
  }

  res.status(201).json({ message: "Employee created" });
});

// Update employee (employee or rider) by their specific user id
router.put("/employees/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const { name, email, role, area } = req.body;
  if (!name && !email && !role && !area) return res.status(400).json({ message: "No fields to update" });

  // Try rider first
  const [riderRows] = await pool.query("SELECT * FROM Rider WHERE RiderID = ? LIMIT 1", [user_id]);
  if (riderRows.length) {
    const rider = riderRows[0];
    const personId = rider.PersonID;
    if (email) {
      const [existing] = await pool.query("SELECT * FROM Person WHERE Email = ? AND PersonID <> ?", [email.trim(), personId]);
      if (existing.length) return res.status(409).json({ message: "Email already in use" });
    }
    if (name || email) await pool.query("UPDATE Person SET " + (name ? "Name = ?" : "") + (name && email ? ", Email = ?" : "") + " WHERE PersonID = ?", [...(name ? [name.trim()] : []), ...(email ? [email.trim()] : []), personId]);

    if (area) {
      const [areaRows] = await pool.query("SELECT AreaID FROM Area WHERE LOWER(AreaName) = LOWER(?) LIMIT 1", [area.trim()]);
      let areaId = null;
      if (areaRows.length) areaId = areaRows[0].AreaID;
      else {
        const [areaResult] = await pool.query("INSERT INTO Area (AreaID, AreaName, LatCoordinate, LngCoordinate) VALUES (NULL, ?, 0, 0)", [area.trim()]);
        areaId = areaResult.insertId;
      }
      await pool.query("UPDATE Rider SET AssignedAreaID = ? WHERE RiderID = ?", [areaId, user_id]);
    }

    return res.json({ message: "Rider updated" });
  }

  // Try employee
  const [empRows] = await pool.query("SELECT * FROM Employee WHERE EmployeeID = ? LIMIT 1", [user_id]);
  if (empRows.length) {
    const emp = empRows[0];
    const personId = emp.PersonID;
    if (email) {
      const [existing] = await pool.query("SELECT * FROM Person WHERE Email = ? AND PersonID <> ?", [email.trim(), personId]);
      if (existing.length) return res.status(409).json({ message: "Email already in use" });
    }
    if (name || email) await pool.query("UPDATE Person SET " + (name ? "Name = ?" : "") + (name && email ? ", Email = ?" : "") + " WHERE PersonID = ?", [...(name ? [name.trim()] : []), ...(email ? [email.trim()] : []), personId]);
    if (area) await pool.query("UPDATE Employee SET Department = ? WHERE EmployeeID = ?", [area.trim(), user_id]);
    return res.json({ message: "Employee updated" });
  }

  res.status(404).json({ message: "Employee or rider not found" });
});

// Delete employee/rider (by their table id)
router.delete("/employees/:user_id", async (req, res) => {
  const { user_id } = req.params;
  // Try rider
  const [riderRows] = await pool.query("SELECT PersonID FROM Rider WHERE RiderID = ? LIMIT 1", [user_id]);
  if (riderRows.length) {
    const personId = riderRows[0].PersonID;
    await pool.query("DELETE FROM Person WHERE PersonID = ?", [personId]);
    return res.json({ message: "Rider removed" });
  }
  const [empRows] = await pool.query("SELECT PersonID FROM Employee WHERE EmployeeID = ? LIMIT 1", [user_id]);
  if (empRows.length) {
    const personId = empRows[0].PersonID;
    await pool.query("DELETE FROM Person WHERE PersonID = ?", [personId]);
    return res.json({ message: "Employee removed" });
  }
  res.status(404).json({ message: "Employee/rider not found" });
});

// --- Customer management for admin ---
router.get("/customers", async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.CustomerID AS user_id, p.Name AS name, p.Email AS email, COALESCE(c.WalletBalance,0) AS balance
     FROM Customer c JOIN Person p ON c.PersonID = p.PersonID WHERE p.IsActive = 1 ORDER BY p.Name`
  );
  res.json(rows);
});

router.post("/customers", async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ message: "Missing required fields" });
  const [existing] = await pool.query("SELECT * FROM Person WHERE Email = ?", [email.trim()]);
  if (existing.length) return res.status(409).json({ message: "Email already in use" });
  const [personResult] = await pool.query("INSERT INTO Person (PersonID, Name, Email, Phone, Password, Role, IsActive) VALUES (NULL, ?, ?, '', '', 'Customer', 1)", [name.trim(), email.trim()]);
  const personId = personResult.insertId;
  await pool.query("INSERT INTO Customer (CustomerID, PersonID, WalletBalance, DefaultAddressID) VALUES (NULL, ?, 0, NULL)", [personId]);
  res.status(201).json({ message: "Customer created" });
});

router.put("/customers/:user_id", async (req, res) => {
  const { user_id } = req.params; // this is CustomerID
  const { name, email } = req.body;
  const [custRows] = await pool.query("SELECT PersonID FROM Customer WHERE CustomerID = ? LIMIT 1", [user_id]);
  if (!custRows.length) return res.status(404).json({ message: "Customer not found" });
  const personId = custRows[0].PersonID;
  if (email) {
    const [existing] = await pool.query("SELECT * FROM Person WHERE Email = ? AND PersonID <> ?", [email.trim(), personId]);
    if (existing.length) return res.status(409).json({ message: "Email already in use" });
  }
  if (name || email) await pool.query("UPDATE Person SET " + (name ? "Name = ?" : "") + (name && email ? ", Email = ?" : "") + " WHERE PersonID = ?", [...(name ? [name.trim()] : []), ...(email ? [email.trim()] : []), personId]);
  res.json({ message: "Customer updated" });
});

router.delete("/customers/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const [custRows] = await pool.query("SELECT PersonID FROM Customer WHERE CustomerID = ? LIMIT 1", [user_id]);
  if (!custRows.length) return res.status(404).json({ message: "Customer not found" });
  const personId = custRows[0].PersonID;
  await pool.query("DELETE FROM Person WHERE PersonID = ?", [personId]);
  res.json({ message: "Customer removed" });
});

const ORDER_STATUSES = ["pending", "confirmed", "preparing", "assigned", "picked_up", "delivered", "cancelled"];

router.get("/areas", async (req, res) => {
  const [rows] = await pool.query(
    `SELECT DISTINCT COALESCE(a.AreaName, IFNULL(ad.City, 'Unknown')) AS area
     FROM Orders o
     LEFT JOIN Address ad ON o.AddressID = ad.AddressID
     LEFT JOIN Area a ON ad.AreaID = a.AreaID
     ORDER BY area`
  );
  res.json(rows.map((row) => row.area));
});

router.get("/categories", async (req, res) => {
  const [rows] = await pool.query(
    `SELECT DISTINCT COALESCE(cat.Name, 'Uncategorized') AS category
     FROM OrderItem oi
     JOIN MenuItem mi ON oi.MenuItemID = mi.MenuItemID
     LEFT JOIN Category cat ON mi.CategoryID = cat.CategoryID
     ORDER BY category`
  );
  res.json(rows.map((row) => row.category));
});

router.get("/orders", async (req, res) => {
  const { area, category } = req.query;
  const params = [];
  const filters = [];

  if (area) {
    filters.push("COALESCE(a.AreaName, IFNULL(ad.City, 'Unknown')) = ?");
    params.push(area);
  }

  if (category) {
    filters.push("cat.Name = ?");
    params.push(category);
  }

  const whereSql = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const [rows] = await pool.query(
    `SELECT o.OrderID AS order_id, ANY_VALUE(p.Name) AS customer_name, ANY_VALUE(b.TotalAmount) AS total_amount,
            ANY_VALUE(o.OrderStatus) AS status,
            ANY_VALUE(IF(o.AssignedRiderID IS NULL, 'unassigned', o.OrderStatus)) AS delivery_status,
            ANY_VALUE(CONCAT(rp.Name)) AS employee_name,
            ANY_VALUE(rp.Phone) AS employee_phone,
            ANY_VALUE(CONCAT(ad.Street, ', ', ad.City)) AS delivery_address,
            ANY_VALUE(COALESCE(a.AreaName, IFNULL(ad.City, 'Unknown'))) AS area,
            GROUP_CONCAT(DISTINCT COALESCE(cat.Name, 'Uncategorized') ORDER BY cat.Name SEPARATOR ', ') AS categories,
            ANY_VALUE(pay.Method) AS payment_method,
            ANY_VALUE(o.PlacedAt) AS placed_at,
            ANY_VALUE(o.ConfirmedAt) AS confirmed_at,
            ANY_VALUE(o.ReadyAt) AS ready_at,
            ANY_VALUE(o.DeliveredAt) AS delivered_at,
            ANY_VALUE(o.CancelledAt) AS cancelled_at
     FROM Orders o
     JOIN Customer c ON o.CustomerID = c.CustomerID
     JOIN Person p ON c.PersonID = p.PersonID
     LEFT JOIN Bill b ON b.OrderID = o.OrderID
     LEFT JOIN Rider r ON o.AssignedRiderID = r.RiderID
     LEFT JOIN Person rp ON r.PersonID = rp.PersonID
     LEFT JOIN Address ad ON o.AddressID = ad.AddressID
     LEFT JOIN Area a ON ad.AreaID = a.AreaID
     LEFT JOIN OrderItem oi ON oi.OrderID = o.OrderID
     LEFT JOIN MenuItem mi ON oi.MenuItemID = mi.MenuItemID
     LEFT JOIN Category cat ON mi.CategoryID = cat.CategoryID
     LEFT JOIN Payment pay ON pay.BillID = b.BillID
     ${whereSql}
     GROUP BY o.OrderID
     ORDER BY placed_at DESC`,
    params
  );

  res.json(rows.map((row) => ({
    ...row,
    status: String(row.status || "").toLowerCase(),
    delivery_status: String(row.delivery_status || "").toLowerCase(),
    employee_name: row.employee_name || "",
    employee_phone: row.employee_phone || "",
    delivery_address: row.delivery_address || "",
    payment_method: row.payment_method || "",
    area: row.area || "Unknown",
    categories: row.categories ? row.categories.split(', ').filter(Boolean) : [],
  })));
});

router.get("/orders/:order_id", async (req, res) => {
  const { order_id } = req.params;
  const [rows] = await pool.query(
    `SELECT o.OrderID AS order_id, p.Name AS customer_name, p.Phone AS customer_phone,
            b.TotalAmount AS total_amount, o.OrderStatus AS status,
            IF(o.AssignedRiderID IS NULL, 'unassigned', o.OrderStatus) AS delivery_status,
            CONCAT(rp.Name) AS employee_name, rp.Phone AS employee_phone,
            CONCAT(a.Street, ', ', a.City) AS delivery_address,
            pay.Method AS payment_method,
            o.PlacedAt AS placed_at, o.ConfirmedAt AS confirmed_at,
            o.ReadyAt AS ready_at, o.DeliveredAt AS delivered_at,
            o.CancelledAt AS cancelled_at, o.CancelReason AS cancel_reason
     FROM Orders o
     JOIN Customer c ON o.CustomerID = c.CustomerID
     JOIN Person p ON c.PersonID = p.PersonID
     LEFT JOIN Bill b ON b.OrderID = o.OrderID
     LEFT JOIN Rider r ON o.AssignedRiderID = r.RiderID
     LEFT JOIN Person rp ON r.PersonID = rp.PersonID
     LEFT JOIN Address a ON o.AddressID = a.AddressID
     LEFT JOIN Payment pay ON pay.BillID = b.BillID
     WHERE o.OrderID = ? LIMIT 1`,
    [order_id]
  );

  if (!rows.length) return res.status(404).json({ message: "Order not found" });

  const [items] = await pool.query(
    `SELECT oi.OrderItemID AS item_id, mi.Name AS name, oi.Quantity AS quantity, oi.UnitPrice AS unit_price
     FROM OrderItem oi
     JOIN MenuItem mi ON oi.MenuItemID = mi.MenuItemID
     WHERE oi.OrderID = ?`,
    [order_id]
  );

  const row = rows[0];
  res.json({
    ...row,
    status: String(row.status || "").toLowerCase(),
    delivery_status: String(row.delivery_status || "").toLowerCase(),
    employee_name: row.employee_name || "",
    employee_phone: row.employee_phone || "",
    delivery_address: row.delivery_address || "",
    payment_method: row.payment_method || "",
    items,
  });
});

router.put("/orders/:order_id/status", async (req, res) => {
  const { order_id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ message: "Missing status" });

  const normalized = String(status).trim().toLowerCase();
  if (!ORDER_STATUSES.includes(normalized)) {
    return res.status(400).json({ message: "Invalid order status" });
  }

  const fields = ["OrderStatus = ?"];
  const params = [normalized];
  if (normalized === "confirmed") fields.push("ConfirmedAt = NOW()");
  if (normalized === "assigned") fields.push("ReadyAt = NOW()");
  if (normalized === "picked_up") fields.push("ReadyAt = NOW()");
  if (normalized === "delivered") fields.push("DeliveredAt = NOW()");
  if (normalized === "cancelled") fields.push("CancelledAt = NOW()");

  await pool.query(
    `UPDATE Orders SET ${fields.join(", ")} WHERE OrderID = ?`,
    [...params, order_id]
  );

  res.json({ message: "Order updated" });
});

router.post("/assign", async (req, res) => {
  const { order_id, employee_id } = req.body;
  if (!order_id || !employee_id) return res.status(400).json({ message: "Missing order_id or employee_id" });

  await pool.query("UPDATE Orders SET AssignedRiderID = ?, OrderStatus = 'assigned', ReadyAt = NOW() WHERE OrderID = ?", [employee_id, order_id]);
  res.json({ message: "Order assigned" });
});

router.get("/dashboard", async (req, res) => {
  const [[{ total_orders }]] = await pool.query("SELECT COUNT(*) AS total_orders FROM Orders");
  const [[{ total_revenue }]] = await pool.query("SELECT COALESCE(SUM(TotalAmount),0) AS total_revenue FROM Bill");
  const [[{ total_customers }]] = await pool.query("SELECT COUNT(DISTINCT CustomerID) AS total_customers FROM Orders");
  const [[{ pending_orders }]] = await pool.query("SELECT COUNT(*) AS pending_orders FROM Orders WHERE OrderStatus IN ('pending','confirmed','preparing','assigned','picked_up')");

  const [recent_orders] = await pool.query(
    `SELECT o.OrderID AS order_id, p.Name AS customer, b.TotalAmount AS total_amount, o.OrderStatus AS status
     FROM Orders o
     JOIN Customer c ON o.CustomerID = c.CustomerID
     JOIN Person p ON c.PersonID = p.PersonID
     LEFT JOIN Bill b ON b.OrderID = o.OrderID
     ORDER BY o.PlacedAt DESC LIMIT 10`
  );

  const [top_items] = await pool.query(
    `SELECT mi.Name AS name, SUM(oi.Quantity) AS total_sold
     FROM OrderItem oi
     JOIN MenuItem mi ON oi.MenuItemID = mi.MenuItemID
     GROUP BY oi.MenuItemID
     ORDER BY total_sold DESC
     LIMIT 10`
  );

  const [orders_by_category] = await pool.query(
    `SELECT COALESCE(c.Name, 'Uncategorized') AS category, SUM(oi.Quantity) AS total_orders
     FROM OrderItem oi
     JOIN MenuItem mi ON oi.MenuItemID = mi.MenuItemID
     LEFT JOIN Category c ON mi.CategoryID = c.CategoryID
     GROUP BY category
     ORDER BY total_orders DESC
     LIMIT 6`
  );

  const [orders_by_area] = await pool.query(
    `SELECT COALESCE(a.AreaName, IFNULL(ad.City, 'Unknown')) AS area, COUNT(*) AS total_orders
     FROM Orders o
     LEFT JOIN Address ad ON o.AddressID = ad.AddressID
     LEFT JOIN Area a ON ad.AreaID = a.AreaID
     GROUP BY area
     ORDER BY total_orders DESC
     LIMIT 6`
  );

  res.json({
    total_orders,
    total_revenue,
    total_customers,
    pending_orders,
    recent_orders,
    top_items,
    orders_by_category,
    orders_by_area,
  });
});

export default router;
