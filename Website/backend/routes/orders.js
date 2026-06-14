import express from "express";
import { pool } from "../utils/db.js";
import { authenticate } from "../utils/auth.js";

const router = express.Router();
router.use(authenticate);

const getCustomerId = async (personId) => {
  const [customerRows] = await pool.query("SELECT CustomerID FROM Customer WHERE PersonID = ? LIMIT 1", [personId]);
  return customerRows[0]?.CustomerID || null;
};

router.get("/my", async (req, res) => {
  const customerId = await getCustomerId(req.user.PersonID);
  if (!customerId) return res.status(404).json({ message: "Customer not found" });

  const [rows] = await pool.query(
    `SELECT o.OrderID AS order_id, o.OrderStatus AS status,
            IF(o.AssignedRiderID IS NULL, 'unassigned', o.OrderStatus) AS delivery_status,
            o.PlacedAt AS created_at, b.TotalAmount AS total_amount,
            o.CancelledAt AS cancelled_at
     FROM Orders o
     JOIN Bill b ON b.OrderID = o.OrderID
     WHERE o.CustomerID = ?
     ORDER BY o.PlacedAt DESC`,
    [customerId]
  );
  res.json(rows.map((row) => ({
    ...row,
    status: String(row.status || "").toLowerCase(),
    delivery_status: String(row.delivery_status || "").toLowerCase(),
  })));
});

router.get("/:order_id", async (req, res) => {
  const { order_id } = req.params;
  const customerId = await getCustomerId(req.user.PersonID);
  if (!customerId) return res.status(404).json({ message: "Customer not found" });

  const [orderRows] = await pool.query(
    `SELECT o.OrderID AS order_id, o.OrderStatus AS status, o.AddressID AS address_id,
            o.PromoCodeID AS promo_id, pay.Method AS payment_method,
            IF(o.AssignedRiderID IS NULL, 'unassigned', o.OrderStatus) AS delivery_status,
            CONCAT(rp.Name) AS employee_name, rp.Phone AS employee_phone,
            o.ConfirmedAt AS confirmed_at, o.ReadyAt AS ready_at,
            o.DeliveredAt AS delivered_at, o.CancelledAt AS cancelled_at
     FROM Orders o
     LEFT JOIN Bill b ON b.OrderID = o.OrderID
     LEFT JOIN Payment pay ON pay.BillID = b.BillID
     LEFT JOIN Rider r ON o.AssignedRiderID = r.RiderID
     LEFT JOIN Person rp ON r.PersonID = rp.PersonID
     WHERE o.OrderID = ? AND o.CustomerID = ?`,
    [order_id, customerId]
  );
  if (!orderRows.length) return res.status(404).json({ message: "Order not found" });

  const [items] = await pool.query(
    `SELECT oi.Quantity AS quantity, oi.UnitPrice AS unit_price, mi.Name AS name
     FROM OrderItem oi
     JOIN MenuItem mi ON oi.MenuItemID = mi.MenuItemID
     WHERE oi.OrderID = ?`,
    [order_id]
  );

  const [addressRows] = await pool.query("SELECT CONCAT(Street, ', ', City) AS delivery_address FROM Address WHERE AddressID = ?", [orderRows[0].address_id]);
  res.json({
    ...orderRows[0],
    status: String(orderRows[0].status || "").toLowerCase(),
    delivery_status: String(orderRows[0].delivery_status || "").toLowerCase(),
    items,
    delivery_address: addressRows[0]?.delivery_address || "",
  });
});

router.put("/:order_id/cancel", async (req, res) => {
  const { order_id } = req.params;
  const customerId = await getCustomerId(req.user.PersonID);
  if (!customerId) return res.status(404).json({ message: "Customer not found" });

  const [rows] = await pool.query(
    "SELECT OrderStatus FROM Orders WHERE OrderID = ? AND CustomerID = ? LIMIT 1",
    [order_id, customerId]
  );
  if (!rows.length) return res.status(404).json({ message: "Order not found" });

  const status = String(rows[0].OrderStatus || "").toLowerCase();
  if (!["pending", "confirmed"].includes(status)) {
    return res.status(400).json({ message: "Order cannot be cancelled at this stage" });
  }

  await pool.query(
    "UPDATE Orders SET OrderStatus = 'cancelled', CancelledAt = NOW() WHERE OrderID = ? AND CustomerID = ?",
    [order_id, customerId]
  );
  res.json({ message: "Order cancelled" });
});

router.post("/", async (req, res) => {
  const { delivery_address, payment_method } = req.body;
  if (!delivery_address || !payment_method) return res.status(400).json({ message: "Missing delivery address or payment method" });

  const customerId = await getCustomerId(req.user.PersonID);
  if (!customerId) return res.status(404).json({ message: "Customer not found" });

  const [cartRows] = await pool.query("SELECT CartID FROM Cart WHERE CustomerID = ? LIMIT 1", [customerId]);
  if (!cartRows.length) return res.status(400).json({ message: "Cart is empty" });
  const cartId = cartRows[0].CartID;

  const [items] = await pool.query("SELECT * FROM CartItem WHERE CartID = ?", [cartId]);
  if (!items.length) return res.status(400).json({ message: "Cart is empty" });

  let addressId = null;
  const street = delivery_address.trim();
  if (street) {
    const [addressRows] = await pool.query(
      "SELECT AddressID FROM Address WHERE CustomerID = ? AND Street = ? LIMIT 1",
      [customerId, street]
    );
    if (addressRows.length) {
      addressId = addressRows[0].AddressID;
    } else {
      const [addressResult] = await pool.query(
        "INSERT INTO Address (AddressID, CustomerID, AreaID, Label, Street, City) VALUES (NULL, ?, NULL, 'Delivery', ?, '')",
        [customerId, street]
      );
      addressId = addressResult.insertId;
    }
  }

  const [orderResult] = await pool.query("INSERT INTO Orders (OrderID, CustomerID, AdminID, AddressID, PromoCodeID, OrderStatus, PlacedAt) VALUES (NULL, ?, NULL, ?, NULL, 'pending', NOW())", [customerId, addressId]);
  const orderId = orderResult.insertId;

  let total = 0;
  for (const item of items) {
    total += item.Quantity * item.Price;
    await pool.query(
      "INSERT INTO OrderItem (OrderItemID, OrderID, MenuItemID, VariantID, Quantity, UnitPrice) VALUES (NULL, ?, ?, NULL, ?, ?)",
      [orderId, item.MenuItemID, item.Quantity, item.Price]
    );
  }

  const tax = total * 0.13;
  const paymentStatus = payment_method === "cash" ? "pending" : "paid";
  const [billResult] = await pool.query(
    "INSERT INTO Bill (BillID, OrderID, SubTotal, TaxAmount, DiscountAmount, TotalAmount, PaymentStatus, GeneratedAt) VALUES (NULL, ?, ?, ?, 0, ?, ?, NOW())",
    [orderId, total, tax, total + tax, paymentStatus]
  );

  const billId = billResult.insertId;
  const paidAt = paymentStatus === "paid" ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null;
  await pool.query(
    "INSERT INTO Payment (PaymentID, BillID, Method, TransactionRef, GatewayResponse, PaidAt) VALUES (NULL, ?, ?, NULL, NULL, ?)",
    [billId, payment_method, paidAt]
  );

  await pool.query("DELETE FROM CartItem WHERE CartID = ?", [cartId]);
  res.status(201).json({ order_id: orderId });
});

export default router;
