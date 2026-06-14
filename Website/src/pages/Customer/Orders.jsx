import { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import ConfirmModal from "../../components/ui/ConfirmModal";
import EmptyState from "../../components/ui/EmptyState";
import OrderTimeline from "../../components/OrderTimeline";
import Spinner from "../../components/ui/Spinner";

export default function Orders() {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => {
    api.get("/orders/my").then((r) => setOrders(r.data)).catch(() => addToast("Could not load orders", "error"));
  }, [addToast]);

  const toggle = async (order_id) => {
    if (expanded === order_id) {
      setExpanded(null);
      setDetail(null);
      return;
    }
    setExpanded(order_id);
    setLoadingDetail(true);
    try {
      const { data } = await api.get(`/orders/${order_id}`);
      setDetail(data);
    } catch {
      addToast("Could not load order details", "error");
    } finally {
      setLoadingDetail(false);
    }
  };

  const cancel = async () => {
    if (!cancelTarget) return;
    try {
      await api.put(`/orders/${cancelTarget}/cancel`);
      setOrders((current) => current.map((x) => x.order_id === cancelTarget ? { ...x, status: "cancelled" } : x));
      setDetail((current) => current ? { ...current, status: "cancelled" } : current);
      addToast("Order cancelled", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Unable to cancel the order", "error");
    } finally {
      setCancelTarget(null);
    }
  };

  if (!orders.length) {
    return (
      <div className="page-narrow">
        <EmptyState title="No orders yet" description="Your order history will appear here after checkout." />
      </div>
    );
  }

  return (
    <div className="page-narrow">
      <h2 className="page-title" style={{ color: "var(--color-primary)" }}>My Orders</h2>

      {orders.map((o) => (
        <div key={o.order_id} className="card" style={{ marginBottom: 12 }}>
          <button
            type="button"
            className="card-padded"
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", border: "none", background: "transparent", cursor: "pointer", textAlign: "left" }}
            onClick={() => toggle(o.order_id)}
            aria-expanded={expanded === o.order_id}
          >
            <div>
              <strong>Order #{o.order_id}</strong>
              <span style={{ marginLeft: 12, fontSize: 13, color: "var(--color-text-muted)" }}>
                {new Date(o.created_at).toLocaleDateString()}
              </span>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Badge status={o.status}>{o.status.replace(/_/g, " ")}</Badge>
              <strong>Rs. {o.total_amount}</strong>
              <span aria-hidden="true">{expanded === o.order_id ? "▲" : "▼"}</span>
            </div>
          </button>

          {expanded === o.order_id && (
            <div className="card-padded" style={{ borderTop: "1px solid var(--color-border)" }}>
              {loadingDetail ? (
                <Spinner label="Loading details..." />
              ) : detail && (
                <>
                  <OrderTimeline order={{ ...detail, created_at: o.created_at }} />
                  <p><strong>Delivery to:</strong> {detail.delivery_address}</p>
                  <p><strong>Payment:</strong> {detail.payment_method}</p>
                  {detail.employee_name && <p><strong>Delivery by:</strong> {detail.employee_name}</p>}
                  <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8, fontSize: 14 }}>
                    <thead>
                      <tr><th align="left">Item</th><th>Qty</th><th align="right">Price</th></tr>
                    </thead>
                    <tbody>
                      {detail.items?.map((item, i) => (
                        <tr key={i}>
                          <td>{item.name}</td>
                          <td align="center">{item.quantity}</td>
                          <td align="right">Rs. {item.unit_price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {["pending", "confirmed"].includes(o.status) && (
                    <Button variant="danger" size="sm" style={{ marginTop: 12 }} onClick={() => setCancelTarget(o.order_id)}>
                      Cancel Order
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      ))}

      <ConfirmModal
        open={!!cancelTarget}
        title="Cancel order?"
        message="This action cannot be undone."
        confirmLabel="Cancel order"
        danger
        onCancel={() => setCancelTarget(null)}
        onConfirm={cancel}
      />
    </div>
  );
}
