const STATUS_COLORS = {
  pending: "#ffc107",
  confirmed: "#17a2b8",
  preparing: "#fd7e14",
  assigned: "#6f42c1",
  picked_up: "#007bff",
  delivered: "#28a745",
  cancelled: "#dc3545",
  unassigned: "#6c757d",
};

export default function Badge({ children, status, className = "" }) {
  const style = status ? { background: STATUS_COLORS[status] || "#aaa" } : undefined;
  const classes = ["badge", !status ? "badge-category" : "", className].filter(Boolean).join(" ");
  return (
    <span className={classes} style={style}>
      {children}
    </span>
  );
}
