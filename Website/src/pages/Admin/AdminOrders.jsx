import { useEffect, useState } from "react";
import api from "../../services/api";

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  assigned: "Assigned",
  picked_up: "Picked Up",
  delivered: "Delivered",
  cancelled: "Cancelled",
  unassigned: "Unassigned",
};

const statusColors = {
  pending: "#f59e0b",
  confirmed: "#0ea5e9",
  preparing: "#f97316",
  assigned: "#8b5cf6",
  picked_up: "#3b82f6",
  delivered: "#16a34a",
  cancelled: "#ef4444",
  unassigned: "#64748b",
};

const ORDER_OPTIONS = [
  "pending",
  "confirmed",
  "preparing",
  "assigned",
  "picked_up",
  "delivered",
  "cancelled",
];

const formatDate = (value) => value ? new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "—";

const getTimeline = (order) => {
  const isCancelled = order.status === "cancelled";
  const steps = [
    { key: "received", label: "Order received", active: !!order.placed_at, date: order.placed_at },
    { key: "confirmed", label: "Confirmed", active: !!order.confirmed_at || order.status !== "pending", date: order.confirmed_at },
    { key: "preparing", label: "Preparing", active: ["preparing", "assigned", "picked_up", "delivered"].includes(order.status), date: order.ready_at },
    { key: "out_for_delivery", label: "Out for delivery", active: ["assigned", "picked_up", "delivered"].includes(order.status), date: order.ready_at },
    { key: "delivered", label: isCancelled ? "Cancelled" : "Delivered", active: order.status === "delivered" || isCancelled, date: isCancelled ? order.cancelled_at : order.delivered_at },
  ];

  return steps;
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [areas, setAreas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [assign, setAssign] = useState({});
  const [details, setDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(null);
  const [message, setMessage] = useState("");
  const [expanded, setExpanded] = useState(null);

  const fetchOrders = (area = selectedArea, category = selectedCategory) => {
    const params = {};
    if (area) params.area = area;
    if (category) params.category = category;
    api.get("/admin/orders", { params }).then((r) => setOrders(r.data)).catch(console.error);
  };

  const fetchFilters = () => {
    api.get("/admin/areas").then((r) => setAreas(r.data)).catch(console.error);
    api.get("/admin/categories").then((r) => setCategories(r.data)).catch(console.error);
  };

  const fetchEmployees = () => {
    api.get("/admin/employees").then((r) => setEmployees(r.data)).catch(console.error);
  };

  const fetchAll = () => {
    fetchFilters();
    fetchEmployees();
    fetchOrders();
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const loadOrderDetails = async (order_id) => {
    if (details[order_id]) return details[order_id];
    setLoadingDetails(order_id);
    try {
      const { data } = await api.get(`/admin/orders/${order_id}`);
      setDetails((prev) => ({ ...prev, [order_id]: data }));
      return data;
    } finally {
      setLoadingDetails(null);
    }
  };

  const handleAssign = async (order_id) => {
    const employee_id = assign[order_id];
    if (!employee_id) return setMessage("Please select an employee before assigning.");

    try {
      await api.post("/admin/assign", { order_id, employee_id });
      setMessage(`Order #${order_id} assigned successfully.`);
      fetchAll();
      loadOrderDetails(order_id);
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to assign order.");
    }
  };

  const handleStatusChange = async (order_id, status) => {
    try {
      await api.put(`/admin/orders/${order_id}/status`, { status });
      setMessage(`Order #${order_id} status updated to ${STATUS_LABELS[status] || status}.`);
      fetchAll();
      loadOrderDetails(order_id);
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to update status.");
    }
  };

  const resetFilters = () => {
    setSelectedArea("");
    setSelectedCategory("");
    fetchOrders("", "");
  };

  const toggleDetails = async (order_id) => {
    if (expanded === order_id) {
      setExpanded(null);
      return;
    }
    setExpanded(order_id);
    await loadOrderDetails(order_id);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <p style={styles.subtitle}>Operations</p>
          <h2 style={styles.title}>Order Management</h2>
        </div>
        <p style={styles.helper}>Track order progress, assign riders, and review status timelines for every transaction.</p>
      </div>

      {message && <div style={styles.alert}>{message}</div>}

      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel} htmlFor="area-filter">Filter by area</label>
          <select
            id="area-filter"
            style={styles.select}
            value={selectedArea}
            onChange={(e) => {
              setSelectedArea(e.target.value);
              fetchOrders(e.target.value, selectedCategory);
            }}
          >
            <option value="">All areas</option>
            {areas.map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel} htmlFor="category-filter">Filter by category</label>
          <select
            id="category-filter"
            style={styles.select}
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              fetchOrders(selectedArea, e.target.value);
            }}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <button style={styles.clearBtn} onClick={resetFilters}>Clear filters</button>
      </div>

      <div style={styles.list}>
        {orders.map((order) => {
          const timeline = getTimeline(order);
          return (
            <article key={order.order_id} style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <span style={styles.orderTag}>#{order.order_id}</span>
                  <h3 style={styles.orderTitle}>{order.customer_name}</h3>
                  <p style={styles.muted}>{formatDate(order.placed_at)}</p>
                </div>
                <div style={styles.badgeRow}>
                  <span style={{ ...styles.statusPill, background: statusColors[order.status] || "#64748b" }}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                  <span style={{ ...styles.statusPill, background: statusColors[order.delivery_status] || "#475569" }}>
                    {STATUS_LABELS[order.delivery_status] || order.delivery_status}
                  </span>
                </div>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.infoGrid}>
                  <div style={styles.infoBlock}>
                    <p style={styles.infoLabel}>Amount</p>
                    <p style={styles.infoValue}>Rs. {order.total_amount}</p>
                  </div>
                  <div style={styles.infoBlock}>
                    <p style={styles.infoLabel}>Delivery rider</p>
                    <p style={styles.infoValue}>{order.employee_name || "Not assigned"}</p>
                  </div>
                  <div style={styles.infoBlock}>
                    <p style={styles.infoLabel}>Delivery area</p>
                    <p style={styles.infoValue}>{order.area || "Unknown"}</p>
                  </div>
                </div>

                <div style={styles.timeline}>
                  {timeline.map((step, index) => (
                    <div key={step.key} style={styles.timelineStep}>
                      <span
                        style={{
                          ...styles.timelineDot,
                          borderColor: step.active ? "#3b82f6" : "#cbd5e1",
                          background: step.active ? "#3b82f6" : "#fff",
                        }}
                      />
                      <div style={styles.timelineContent}>
                        <p style={{ ...styles.timelineLabel, color: step.active ? "#111827" : "#64748b" }}>{step.label}</p>
                        <p style={styles.timelineDate}>{step.date ? formatDate(step.date) : "Pending"}</p>
                      </div>
                      {index < timeline.length - 1 && (
                        <div
                          style={{
                            ...styles.timelineLine,
                            background: timeline[index + 1].active ? "#3b82f6" : "#e2e8f0",
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.cardFooter}>
                <div style={styles.actionGroup}>
                  <select
                    style={styles.select}
                    value={assign[order.order_id] || ""}
                    onChange={(e) => setAssign({ ...assign, [order.order_id]: e.target.value })}
                    disabled={order.delivery_status !== "unassigned"}
                  >
                    <option value="">Assign rider</option>
                    {employees.map((emp) => (
                      <option key={emp.user_id} value={emp.user_id}>{emp.full_name}</option>
                    ))}
                  </select>
                  <button
                    style={styles.assignBtn}
                    onClick={() => handleAssign(order.order_id)}
                    disabled={order.delivery_status !== "unassigned"}
                  >
                    Assign
                  </button>
                </div>
                <div style={styles.actionGroup}>
                  <select
                    style={styles.select}
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                  >
                    {ORDER_OPTIONS.map((status) => (
                      <option key={status} value={status}>{STATUS_LABELS[status]}</option>
                    ))}
                  </select>
                  <button
                    style={styles.expandBtn}
                    onClick={() => toggleDetails(order.order_id)}
                  >
                    {expanded === order.order_id ? "Hide details" : "View details"}
                  </button>
                </div>
              </div>
              {expanded === order.order_id && details[order.order_id] && (
                <div style={styles.detailSection}>
                  <div style={styles.detailGrid}>
                    <div style={styles.detailCard}>
                      <p style={styles.infoLabel}>Delivery Address</p>
                      <p style={styles.infoValue}>{details[order.order_id].delivery_address || "Not provided"}</p>
                    </div>
                    <div style={styles.detailCard}>
                      <p style={styles.infoLabel}>Payment Method</p>
                      <p style={styles.infoValue}>{details[order.order_id].payment_method || "N/A"}</p>
                    </div>
                    <div style={styles.detailCard}>
                      <p style={styles.infoLabel}>Customer Phone</p>
                      <p style={styles.infoValue}>{details[order.order_id].customer_phone || "N/A"}</p>
                    </div>
                    <div style={styles.detailCard}>
                      <p style={styles.infoLabel}>Assigned Rider</p>
                      <p style={styles.infoValue}>{details[order.order_id].employee_name ? `${details[order.order_id].employee_name} (${details[order.order_id].employee_phone || "—"})` : "Unassigned"}</p>
                    </div>
                  </div>

                  <div style={styles.itemsTableWrapper}>
                    <h4 style={styles.subheading}>Order items</h4>
                    <table style={styles.itemsTable}>
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Qty</th>
                          <th>Unit price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {details[order.order_id].items?.map((item) => (
                          <tr key={item.item_id}>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                            <td>Rs. {item.unit_price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "24px 32px", maxWidth: 1160, margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, marginBottom: 24, flexWrap: "wrap" },
  subtitle: { margin: 0, color: "#f59e0b", textTransform: "uppercase", fontSize: 12, letterSpacing: "0.14em" },
  title: { margin: "8px 0 0", fontSize: "2rem", color: "#111827" },
  helper: { margin: 0, color: "#475569", maxWidth: 620 },
  alert: { background: "#d1fae5", borderRadius: 16, padding: "14px 18px", color: "#065f46", marginBottom: 24, boxShadow: "0 12px 28px rgba(16, 185, 129, 0.12)" },
  filters: { display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end", marginBottom: 24 },
  filterGroup: { display: "grid", gap: 8, minWidth: 220, flex: "1 1 240px" },
  filterLabel: { margin: 0, color: "#475569", fontSize: 13, fontWeight: 600 },
  clearBtn: { background: "#e2e8f0", color: "#0f172a", border: "none", borderRadius: 14, padding: "12px 20px", cursor: "pointer", fontWeight: 700, minHeight: 44 },
  list: { display: "grid", gap: 20 },
  card: { background: "#fff", borderRadius: 28, padding: 24, boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)" },
  cardTop: { display: "flex", justifyContent: "space-between", gap: 24, alignItems: "flex-start", flexWrap: "wrap" },
  orderTag: { display: "inline-block", padding: "6px 12px", borderRadius: 9999, background: "#e2e8f0", color: "#475569", fontSize: 12, fontWeight: 700, marginBottom: 10 },
  orderTitle: { margin: 0, fontSize: 20, color: "#0f172a" },
  muted: { margin: "6px 0 0", color: "#64748b", fontSize: 14 },
  badgeRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  statusPill: { color: "#fff", padding: "8px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 700, textTransform: "capitalize" },
  cardBody: { marginTop: 24, display: "grid", gap: 24 },
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 18 },
  infoBlock: { background: "#f8fafc", borderRadius: 18, padding: 18 },
  infoLabel: { margin: 0, color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" },
  infoValue: { margin: "10px 0 0", fontSize: 18, color: "#111827", fontWeight: 700 },
  timeline: { display: "grid", gap: 18, paddingLeft: 20, position: "relative", marginTop: 10 },
  timelineStep: { display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, alignItems: "start", position: "relative" },
  timelineDot: { width: 14, height: 14, borderRadius: "50%", border: "3px solid", marginTop: 6, boxSizing: "border-box" },
  timelineLine: { position: "absolute", top: 24, left: 7, width: 2, height: "calc(100% - 24px)", zIndex: -1 },
  timelineContent: { display: "grid", gap: 4 },
  timelineLabel: { margin: 0, fontWeight: 700, fontSize: 14 },
  timelineDate: { margin: 0, color: "#64748b", fontSize: 13 },
  cardFooter: { marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" },
  actionGroup: { display: "flex", gap: 10, flexWrap: "wrap" },
  select: { padding: "10px 14px", borderRadius: 14, border: "1px solid #cbd5e1", minWidth: 180, color: "#0f172a" },
  assignBtn: { background: "#2563eb", color: "#fff", border: "none", borderRadius: 14, padding: "10px 18px", cursor: "pointer", fontWeight: 700 },
  expandBtn: { background: "#f8fafc", color: "#0f172a", border: "1px solid #cbd5e1", borderRadius: 14, padding: "10px 18px", cursor: "pointer" },
  detailSection: { marginTop: 18, padding: 20, background: "#f8fafc", borderRadius: 18, border: "1px solid #e2e8f0" },
  detailGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 18 },
  detailCard: { background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 4px 18px rgba(15, 23, 42, 0.06)" },
  itemsTableWrapper: { overflowX: "auto" },
  itemsTable: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  subheading: { margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: "#111827" },
};
