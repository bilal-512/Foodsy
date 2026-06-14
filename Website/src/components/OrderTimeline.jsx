const STEPS = [
  { key: "pending", label: "Order placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "assigned", label: "Rider assigned" },
  { key: "picked_up", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

const STATUS_ORDER = STEPS.map((s) => s.key);

export default function OrderTimeline({ order }) {
  if (!order) return null;

  const status = String(order.status || "").toLowerCase();
  if (status === "cancelled") {
    return (
      <div className="alert alert-error" role="status">
        Order cancelled{order.cancelled_at ? ` on ${new Date(order.cancelled_at).toLocaleString()}` : ""}.
      </div>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(status);

  const timestampFor = (key) => {
    if (key === "pending") return order.created_at || order.placed_at;
    if (key === "confirmed") return order.confirmed_at;
    if (key === "preparing" || key === "assigned") return order.ready_at;
    if (key === "picked_up") return order.ready_at;
    if (key === "delivered") return order.delivered_at;
    return null;
  };

  return (
    <div className="order-timeline" aria-label="Order progress">
      {STEPS.map((step, index) => {
        const done = currentIndex > index || status === step.key && currentIndex >= index;
        const active = status === step.key;
        const time = timestampFor(step.key);
        return (
          <div key={step.key} className={`timeline-step ${done ? "done" : ""} ${active ? "active" : ""}`}>
            <div className="timeline-dot">{done ? "✓" : index + 1}</div>
            <div>
              <div className="timeline-label">{step.label}</div>
              {time && <div className="timeline-time">{new Date(time).toLocaleString()}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
