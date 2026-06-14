import express from "express";
import { pool } from "../utils/db.js";
import { authenticate, authorize } from "../utils/auth.js";

const router = express.Router();
router.use(authenticate);
router.use(authorize(["employee","rider"]));

router.get("/orders", async (req, res) => {
  const [riderRows] = await pool.query(
    `SELECT r.RiderID FROM Rider r
     JOIN Person p ON r.PersonID = p.PersonID
     WHERE p.PersonID = ? LIMIT 1`,
    [req.user.PersonID]
  );
  if (!riderRows.length) return res.status(404).json({ message: "Rider not found" });

  const riderId = riderRows[0].RiderID;
  const [orders] = await pool.query(
    `SELECT o.OrderID AS order_id, p.Name AS customer_name, p.Phone AS customer_phone,
            CONCAT(a.Street, ', ', a.City) AS delivery_address,
            b.TotalAmount AS total_amount, o.OrderStatus AS delivery_status
     FROM Orders o
     JOIN Customer c ON o.CustomerID = c.CustomerID
     JOIN Person p ON c.PersonID = p.PersonID
     LEFT JOIN Address a ON o.AddressID = a.AddressID
     LEFT JOIN Bill b ON b.OrderID = o.OrderID
     WHERE o.AssignedRiderID = ?`,
    [riderId]
  );
  res.json(orders);
});

const VALID_RIDER_STATUSES = ["picked_up", "delivered"];

router.put("/orders/:order_id/status", async (req, res) => {
  const { order_id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ message: "Missing status" });

  const normalized = String(status).trim().toLowerCase();
  if (!VALID_RIDER_STATUSES.includes(normalized)) {
    return res.status(400).json({ message: "Invalid status update" });
  }

  const [riderRows] = await pool.query(
    `SELECT r.RiderID FROM Rider r
     JOIN Person p ON r.PersonID = p.PersonID
     WHERE p.PersonID = ? LIMIT 1`,
    [req.user.PersonID]
  );
  if (!riderRows.length) return res.status(404).json({ message: "Rider not found" });

  const riderId = riderRows[0].RiderID;
  const [result] = await pool.query(
    `UPDATE Orders SET OrderStatus = ?, ${normalized === "delivered" ? "DeliveredAt = NOW()" : ""}${normalized === "picked_up" ? "ReadyAt = NOW()" : ""}
     WHERE OrderID = ? AND AssignedRiderID = ?`,
    [normalized, order_id, riderId]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "Order not found or not assigned to you" });
  }

  res.json({ message: "Status updated" });
});

export default router;
