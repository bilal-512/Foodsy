import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header style={styles.nav}>
      <div style={styles.left}>
        <Link to="/" style={styles.brand}>Foodsy</Link>
        <Link to="/" style={styles.link}>Home</Link>
      </div>

      <div style={styles.links}>
        {!user && <>
          <Link to="/login" style={styles.link}>Login</Link>
          <Link to="/register" style={styles.link}>Register</Link>
        </>}

        {user?.role === "customer" && <>
          <Link to="/menu" style={styles.link}>Menu</Link>
          <Link to="/cart" style={styles.link}>Cart</Link>
          <Link to="/orders" style={styles.link}>My Orders</Link>
        </>}

        {(["employee", "rider"]).includes(user?.role) && <>
          <Link to="/employee/orders" style={styles.link}>Deliveries</Link>
        </>}

        {user?.role === "admin" && <>
          <Link to="/admin/dashboard" style={styles.link}>Dashboard</Link>
          <Link to="/admin/menu" style={styles.link}>Menu Mgmt</Link>
          <Link to="/admin/employees" style={styles.link}>Team</Link>
          <Link to="/admin/customers" style={styles.link}>Customers</Link>
          <Link to="/admin/orders" style={styles.link}>Orders</Link>
        </>}

        {user && <>
          <Link to="/profile" style={styles.link}>Profile</Link>
          <button onClick={handleLogout} style={styles.btn}>Logout</button>
        </>}
      </div>
    </header>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 32px",
    background: "#1f2937",
    color: "#fff",
    position: "sticky",
    top: 0,
    zIndex: 20,
    boxShadow: "0 4px 24px rgba(15, 23, 42, 0.12)",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: 24,
  },
  brand: {
    color: "#fbbf24",
    fontWeight: "bold",
    fontSize: "1.45rem",
    textDecoration: "none",
  },
  links: {
    display: "flex",
    gap: 18,
    alignItems: "center",
    flexWrap: "wrap",
  },
  link: {
    color: "#e5e7eb",
    textDecoration: "none",
    fontWeight: 500,
  },
  btn: {
    background: "#fbbf24",
    color: "#1f2937",
    border: "none",
    borderRadius: 9999,
    padding: "10px 18px",
    cursor: "pointer",
    fontWeight: 600,
  },
};
