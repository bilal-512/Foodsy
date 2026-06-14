import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { MenuSkeleton } from "../../components/ui/Spinner";
import { useToast } from "../../context/ToastContext";

export default function Menu() {
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const filter = searchParams.get("category") || "all";

  useEffect(() => {
    api.get("/menu/categories")
      .then((res) => setCategories(res.data))
      .catch(() => addToast("Could not load categories", "error"));
  }, [addToast]);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filter !== "all") params.category = filter;
    if (searchTerm) params.search = searchTerm;

    api.get("/menu", { params })
      .then((r) => setItems(r.data))
      .catch(() => addToast("Could not load menu", "error"))
      .finally(() => setLoading(false));
  }, [filter, searchTerm, addToast]);

  const addToCart = async (item_id) => {
    try {
      await api.post("/cart", { item_id, quantity: 1 });
      addToast("Added to cart", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Error adding item", "error");
    }
  };

  const handleFilter = (category) => {
    const next = {};
    if (category !== "all") next.category = category;
    if (searchTerm) next.search = searchTerm;
    setSearchParams(next);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    const next = {};
    if (filter !== "all") next.category = filter;
    if (query) next.search = query;
    setSearchParams(next);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Explore our delicious menu</h2>
          <p className="page-subtitle">
            Filter dishes by category, search flavors, and add favorites to your cart in one click.
          </p>
        </div>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, width: "100%", maxWidth: 420 }}>
          <input
            className="input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search dishes or categories"
            aria-label="Search menu"
          />
          <Button type="submit" variant="accent">Search</Button>
        </form>
      </div>

      <div className="filter-row">
        <button
          type="button"
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => handleFilter("all")}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.category_id}
            type="button"
            className={`filter-btn ${filter === c.name.toLowerCase() ? "active" : ""}`}
            onClick={() => handleFilter(c.name.toLowerCase())}
          >
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <MenuSkeleton />
      ) : items.length === 0 ? (
        <div className="empty-state">
          <h3>No items found</h3>
          <p>Try a different category or search term.</p>
        </div>
      ) : (
        <div className="grid-menu">
          {items.map((item) => (
            <article key={item.item_id} className="card card-elevated" style={{ display: "flex", flexDirection: "column", minHeight: 420 }}>
              <img src={item.image_url} alt={item.name} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: 20, flex: 1 }}>
                <Badge>{item.category}</Badge>
                <h3 style={{ margin: 0, fontSize: 20 }}>{item.name}</h3>
                <p style={{ margin: 0, color: "var(--color-text-muted)", lineHeight: 1.7, flex: 1 }}>
                  {item.description || "A mouthwatering option ready for your order."}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <span style={{ fontWeight: 700, fontSize: 18 }}>Rs. {item.price}</span>
                  <Button variant="accent" onClick={() => addToCart(item.item_id)}>Add to cart</Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
