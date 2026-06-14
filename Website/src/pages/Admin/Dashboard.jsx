import { useEffect, useState } from "react";
import api from "../../services/api";

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

export default function Dashboard() {
  const [data, setData] = useState(null);

  const fetchData = () => {
    api.get("/admin/dashboard").then((r) => setData(r.data)).catch(console.error);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!data) return <p style={{ padding: 32 }}>Loading dashboard...</p>;

  const pendingPercent = data.total_orders ? Math.round((data.pending_orders / data.total_orders) * 100) : 0;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <p style={styles.subtitle}>Admin dashboard</p>
          <h2 style={styles.title}>Daily Operations Overview</h2>
        </div>
        <button style={styles.actionBtn} onClick={fetchData}>Refresh data</button>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Total orders</p>
          <p style={styles.statValue}>{data.total_orders}</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Total revenue</p>
          <p style={styles.statValue}>{formatCurrency(data.total_revenue)}</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Customers served</p>
          <p style={styles.statValue}>{data.total_customers}</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Pending orders</p>
          <p style={styles.statValue}>{data.pending_orders}</p>
        </div>
      </div>

      <div style={styles.mainGrid}>
        <div style={styles.largeCard}>
          <div style={styles.largeCardHeader}>
            <div>
              <p style={styles.sectionTitle}>Order pipeline</p>
              <p style={styles.sectionCopy}>Track the ratio of orders still waiting, and stay ahead of operational bottlenecks.</p>
            </div>
            <span style={styles.metric}>{pendingPercent}% pending</span>
          </div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${pendingPercent}%` }} />
          </div>
          <p style={styles.progressText}>{pendingPercent}% of orders are pending out of {data.total_orders} total.</p>
        </div>

        <div style={styles.sideColumn}>
          <div style={styles.smallCard}>
            <p style={styles.sectionTitle}>Top dishes</p>
            <ul style={styles.list}>
              {data.top_items.map((item, index) => (
                <li key={index} style={styles.listItem}>
                  <span>{item.name}</span>
                  <strong>{item.total_sold}</strong>
                </li>
              ))}
            </ul>
          </div>

          <div style={styles.smallCard}>
            <p style={styles.sectionTitle}>Orders by food type</p>
            <ul style={styles.list}>
              {data.orders_by_category.map((category, index) => (
                <li key={index} style={styles.listItem}>
                  <span>{category.category}</span>
                  <strong>{category.total_orders}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div style={styles.areaCard}>
        <div style={styles.areaHeader}>
          <p style={styles.sectionTitle}>Orders by area</p>
          <p style={styles.sectionCopy}>See where demand is highest across delivery zones.</p>
        </div>
        <ul style={styles.list}>
          {data.orders_by_area.map((area, index) => (
            <li key={index} style={styles.listItem}>
              <span>{area.area}</span>
              <strong>{area.total_orders}</strong>
            </li>
          ))}
        </ul>
      </div>

      <div style={styles.recentCard}>
        <div style={styles.recentHeader}>
          <div>
            <p style={styles.sectionTitle}>Recent orders</p>
            <p style={styles.sectionCopy}>Review the latest transactions and their current status in one place.</p>
          </div>
          <span style={styles.badge}>{data.recent_orders.length} recent</span>
        </div>
        <div style={styles.recentList}>
          {data.recent_orders.map((order) => (
            <div key={order.order_id} style={styles.orderRow}>
              <div>
                <p style={styles.orderId}>Order #{order.order_id}</p>
                <p style={styles.orderMeta}>{order.customer}</p>
              </div>
              <div style={styles.orderStatusGroup}>
                <span style={styles.orderAmount}>{formatCurrency(order.total_amount)}</span>
                <span style={styles.statusBadge}>{order.status.replace(/_/g, " ")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "24px 32px", maxWidth: 1180, margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, marginBottom: 28, flexWrap: "wrap" },
  subtitle: { margin: 0, color: "#f59e0b", textTransform: "uppercase", fontSize: 12, letterSpacing: "0.12em", fontWeight: 700 },
  title: { margin: "8px 0 0", fontSize: "2.3rem", color: "#0f172a" },
  actionBtn: { background: "#2563eb", color: "#fff", border: "none", borderRadius: 14, padding: "12px 22px", cursor: "pointer", fontWeight: 700 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 28 },
  statCard: { background: "#111827", color: "#fff", borderRadius: 24, padding: 24, boxShadow: "0 24px 60px rgba(15, 23, 42, 0.12)" },
  statLabel: { margin: 0, opacity: 0.7, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em" },
  statValue: { margin: "12px 0 0", fontSize: "2rem", fontWeight: 800 },
  mainGrid: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 28 },
  sideColumn: { display: "grid", gap: 20 },
  areaCard: { background: "#fff", borderRadius: 28, padding: 24, boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)", marginBottom: 28 },
  areaHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, marginBottom: 18, flexWrap: "wrap" },
  largeCard: { background: "#fff", borderRadius: 28, padding: 28, boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)" },
  largeCardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, marginBottom: 24 },
  sectionTitle: { margin: "0 0 8px", fontSize: "1.15rem", color: "#0f172a" },
  sectionCopy: { margin: 0, color: "#475569" },
  metric: { background: "#eff6ff", color: "#1d4ed8", borderRadius: 9999, padding: "8px 14px", fontWeight: 700, fontSize: 14 },
  progressBar: { height: 16, borderRadius: 9999, background: "#e2e8f0", overflow: "hidden", marginBottom: 12 },
  progressFill: { height: "100%", background: "#2563eb", borderRadius: 9999 },
  progressText: { margin: 0, color: "#475569", fontSize: 14 },
  smallCard: { background: "#fff", borderRadius: 28, padding: 24, boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)" },
  list: { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 },
  listItem: { display: "flex", justifyContent: "space-between", gap: 14, padding: "14px 18px", borderRadius: 18, background: "#f8fafc", color: "#0f172a" },
  recentCard: { background: "#fff", borderRadius: 28, padding: 24, boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)" },
  recentHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, marginBottom: 20, flexWrap: "wrap" },
  badge: { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "8px 14px", borderRadius: 9999, background: "#fee2e2", color: "#b91c1c", fontWeight: 700, fontSize: 12 },
  recentList: { display: "grid", gap: 12 },
  orderRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "16px 18px", borderRadius: 18, background: "#f8fafc" },
  orderId: { margin: 0, fontWeight: 700, color: "#0f172a" },
  orderMeta: { margin: "6px 0 0", color: "#64748b" },
  orderStatusGroup: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  orderAmount: { fontWeight: 700, color: "#111827" },
  statusBadge: { background: "#e0f2fe", color: "#0c4a6e", borderRadius: 9999, padding: "8px 14px", fontWeight: 700, textTransform: "capitalize", fontSize: 12 },
};
