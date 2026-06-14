import { useEffect, useState } from "react";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useToast } from "../../context/ToastContext";

const EMPTY = { name: "", description: "", price: "", category: "", image_url: "", is_available: true };

export default function MenuManagement() {
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchItems = () =>
    api.get("/menu").then((r) => setItems(r.data)).catch(() => addToast("Could not load menu", "error"));

  useEffect(() => {
    fetchItems();
    api.get("/menu/categories").then((r) => {
      setCategories(r.data);
      if (!form.category && r.data.length) {
        setForm((f) => ({ ...f, category: r.data[0].name }));
      }
    }).catch(() => addToast("Could not load categories", "error"));
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async () => {
    try {
      if (editing) {
        await api.put(`/menu/${editing}`, form);
        addToast("Item updated", "success");
      } else {
        await api.post("/menu", form);
        addToast("Item added", "success");
      }
      setForm(categories.length ? { ...EMPTY, category: categories[0].name } : EMPTY);
      setEditing(null);
      fetchItems();
    } catch (err) {
      addToast(err.response?.data?.message || "Error saving item", "error");
    }
  };

  const startEdit = (item) => {
    setEditing(item.item_id);
    setForm({
      name: item.name,
      description: item.description || "",
      price: item.price,
      category: item.category,
      image_url: item.image_url || "",
      is_available: item.is_available,
    });
  };

  const deleteItem = async () => {
    if (!deleteTarget) return;
    await api.delete(`/menu/${deleteTarget}`);
    addToast("Item deleted", "success");
    setDeleteTarget(null);
    fetchItems();
  };

  return (
    <div className="page">
      <h2 className="page-title" style={{ color: "var(--color-primary)" }}>Menu Management</h2>

      <div className="card card-padded" style={{ marginBottom: 24 }}>
        <h3 style={{ marginTop: 0 }}>{editing ? "Edit Item" : "Add New Item"}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[["name", "Name"], ["description", "Description"], ["price", "Price"], ["image_url", "Image URL (optional)"]].map(([k, p]) => (
            <input key={k} className="input" placeholder={p} value={form[k]} onChange={set(k)} />
          ))}
          <select className="select" value={form.category} onChange={set("category")}>
            {categories.map((c) => (
              <option key={c.category_id} value={c.name}>{c.name}</option>
            ))}
          </select>
          <select className="select" value={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.value === "true" })}>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <Button onClick={handleSubmit}>{editing ? "Update" : "Add Item"}</Button>
          {editing && <Button variant="secondary" onClick={() => { setEditing(null); setForm(categories.length ? { ...EMPTY, category: categories[0].name } : EMPTY); }}>Cancel</Button>}
        </div>
      </div>

      <div className="card card-padded">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr><th align="left">#</th><th align="left">Name</th><th align="left">Category</th><th align="left">Price</th><th>Available</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.item_id}>
                <td>{item.item_id}</td>
                <td>{item.name}</td>
                <td style={{ textTransform: "capitalize" }}>{item.category}</td>
                <td>Rs. {item.price}</td>
                <td align="center">{item.is_available ? "✓" : "✗"}</td>
                <td>
                  <Button size="sm" variant="secondary" onClick={() => startEdit(item)}>Edit</Button>
                  <Button size="sm" variant="danger" style={{ marginLeft: 6 }} onClick={() => setDeleteTarget(item.item_id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete item?"
        message="This menu item will be permanently removed."
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={deleteItem}
      />
    </div>
  );
}

