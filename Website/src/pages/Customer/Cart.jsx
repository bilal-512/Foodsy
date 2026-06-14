import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/Button";
import Input, { Select } from "../../components/ui/Input";
import EmptyState from "../../components/ui/EmptyState";

export default function Cart() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [address, setAddress] = useState(user?.address || "");
  const [payment, setPayment] = useState("cash");
  const [loading, setLoading] = useState(false);

  const fetchCart = () =>
    api.get("/cart").then((r) => setCart(r.data)).catch(() => addToast("Could not load cart", "error"));

  useEffect(() => { fetchCart(); }, []);

  const remove = async (item_id) => {
    await api.delete(`/cart/${item_id}`);
    fetchCart();
  };

  const updateQty = async (item_id, qty) => {
    if (qty < 1) return remove(item_id);
    await api.put(`/cart/${item_id}`, { quantity: qty });
    fetchCart();
  };

  const checkout = async () => {
    if (!address.trim()) {
      addToast("Please enter a delivery address", "error");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/orders", { delivery_address: address, payment_method: payment });
      addToast(`Order #${data.order_id} placed successfully`, "success");
      navigate("/orders");
    } catch (err) {
      addToast(err.response?.data?.message || "Checkout failed", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!cart.items.length) {
    return (
      <div className="page-narrow">
        <EmptyState
          title="Your cart is empty"
          description="Browse the menu and add your favorite dishes."
          actionLabel="Browse menu"
          onAction={() => navigate("/menu")}
        />
      </div>
    );
  }

  return (
    <div className="page-narrow">
      <h2 className="page-title" style={{ color: "var(--color-primary)" }}>Your Cart</h2>
      <div className="grid-2">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {cart.items.map((item) => (
            <div key={item.item_id} className="card card-padded" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <strong>{item.name}</strong>
                <p style={{ margin: "2px 0", color: "var(--color-text-muted)", fontSize: 13 }}>Rs. {item.price} each</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--color-border)", borderRadius: 4 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => updateQty(item.item_id, item.quantity - 1)} aria-label="Decrease quantity">−</button>
                <span style={{ padding: "0 10px" }}>{item.quantity}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => updateQty(item.item_id, item.quantity + 1)} aria-label="Increase quantity">+</button>
              </div>
              <span style={{ minWidth: 80, textAlign: "right" }}>Rs. {item.subtotal}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => remove(item.item_id)} aria-label="Remove item">✕</button>
            </div>
          ))}
        </div>

        <div className="card card-padded" style={{ height: "fit-content" }}>
          <h3 style={{ marginTop: 0 }}>Order Summary</h3>
          <p>Total: <strong>Rs. {cart.total}</strong></p>
          <Input
            label="Delivery Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your delivery address"
          />
          <Select label="Payment Method" value={payment} onChange={(e) => setPayment(e.target.value)}>
            <option value="cash">Cash on Delivery</option>
            <option value="card">Card</option>
            <option value="online">Online</option>
          </Select>
          <Button block onClick={checkout} disabled={loading} style={{ marginTop: 16 }}>
            {loading ? "Placing..." : "Place Order"}
          </Button>
        </div>
      </div>
    </div>
  );
}
