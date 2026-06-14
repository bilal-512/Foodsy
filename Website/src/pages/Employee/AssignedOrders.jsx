import { useEffect, useState } from "react";
import api from "../../services/api";

export default function AssignedOrders() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = () =>
    api.get("/employee/orders").then(r => setOrders(r.data)).catch(console.error);

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (order_id, status) => {
    await api.put(`/employee/orders/${order_id}/status`, { status });
    fetchOrders();
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>My Assigned Deliveries</h2>
      {!orders.length && <p>No orders assigned to you yet.</p>}
      {orders.map(o => (
        <div key={o.order_id} style={styles.card}>
          <div style={styles.top}>
            <div>
              <strong>Order #{o.order_id}</strong>
              <p style={styles.sub}>{o.customer_name} — {o.customer_phone}</p>
              <p style={styles.sub}>{o.delivery_address}</p>
            </div>
            <div style={{textAlign:"right"}}>
              <p><strong>Rs. {o.total_amount}</strong></p>
              <span style={{ ...styles.badge, background: o.delivery_status==="delivered" ? "#28a745" : "#fd7e14" }}>
                {o.delivery_status?.replace(/_/g," ")}
              </span>
            </div>
          </div>
          {o.delivery_status !== "delivered" && (
            <div style={styles.actions}>
              {o.delivery_status === "assigned" && (
                <button style={styles.btn} onClick={() => updateStatus(o.order_id, "picked_up")}>
                  Mark as Picked Up
                </button>
              )}
              {o.delivery_status === "picked_up" && (
                <button style={{...styles.btn, background:"#28a745"}} onClick={() => updateStatus(o.order_id, "delivered")}>
                  Mark as Delivered
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const styles = {
  page:    { padding:"24px 32px", maxWidth:800, margin:"0 auto" },
  heading: { color:"#e85d04" },
  card:    { background:"#fff", borderRadius:8, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.07)", marginBottom:12 },
  top:     { display:"flex", justifyContent:"space-between" },
  sub:     { margin:"4px 0", fontSize:13, color:"#666" },
  badge:   { color:"#fff", padding:"3px 10px", borderRadius:12, fontSize:12 },
  actions: { marginTop:12, borderTop:"1px solid #f0f0f0", paddingTop:12 },
  btn:     { background:"#e85d04", color:"#fff", border:"none", padding:"8px 16px", borderRadius:4, cursor:"pointer" },
};
