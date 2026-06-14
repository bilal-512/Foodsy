import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get("/menu/featured").then((res) => setFeatured(res.data)).catch(console.error);
    api.get("/menu/categories").then((res) => setCategories(res.data)).catch(console.error);
  }, []);

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroText}>
          <p style={styles.tag}>Modern food delivery, built for your business.</p>
          <h1 style={styles.title}>Delicious meals delivered fast, every day.</h1>
          <p style={styles.subtitle}>Foodsy brings restaurant-quality dishes and smart order tracking together in one professional online experience.</p>
          <div style={styles.ctaRow}>
            <Link to={user ? "/menu" : "/register"} style={styles.primaryBtn}>Start Ordering</Link>
            <Link to="/login" style={styles.secondaryBtn}>Sign In</Link>
          </div>
        </div>
        <div style={styles.heroCards}>
          {featured.slice(0, 3).map((item) => (
            <article key={item.item_id} style={styles.featureCard}>
              <img src={item.image_url} alt={item.name} style={styles.featureImage} />
              <div>
                <p style={styles.featureCategory}>{item.category}</p>
                <h3 style={styles.featureTitle}>{item.name}</h3>
                <p style={styles.featureDesc}>{item.description || "Tasty, fresh, and ready to enjoy."}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <p style={styles.sectionLabel}>Built for growth</p>
            <h2 style={styles.sectionTitle}>A modern experience for customers, riders, and managers.</h2>
          </div>
          <p style={styles.sectionCopy}>Streamline orders, manage delivery, and scale your food business with a clean admin portal and a polished customer storefront.</p>
        </div>

        <div style={styles.grid}>
          <div style={styles.cardFeature}>
            <h3>Fast ordering</h3>
            <p>Browse dishes with intuitive filters, learning customers, and lightning-fast checkout.</p>
          </div>
          <div style={styles.cardFeature}>
            <h3>Inventory & menu</h3>
            <p>Admin users can manage menu items, categories, and availability from one dashboard.</p>
          </div>
          <div style={styles.cardFeature}>
            <h3>Delivery tracking</h3>
            <p>Riders can view assigned deliveries, update status, and keep every order on time.</p>
          </div>
          <div style={styles.cardFeature}>
            <h3>Secure auth</h3>
            <p>JWT-based login keeps profiles safe while letting users access the correct role flows.</p>
          </div>
        </div>
      </section>

      <section style={styles.section}> 
        <p style={styles.sectionLabel}>Featured categories</p>
        <div style={styles.categoryGrid}>
          {categories.slice(0, 6).map((category) => (
            <div key={category.category_id} style={styles.categoryCard}>
              <img src={category.image_url} alt={category.name} style={styles.categoryImage} />
              <div>
                <h4 style={styles.categoryName}>{category.name}</h4>
                <p style={styles.categoryText}>{category.description || "Top dishes and best sellers."}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { padding: "40px 32px", maxWidth: 1220, margin: "0 auto" },
  hero: { display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 32, alignItems: "center", marginBottom: 48 },
  heroText: { maxWidth: 620 },
  tag: { margin: 0, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 12 },
  title: { margin: "20px 0 16px", fontSize: "3.4rem", lineHeight: 1.05, color: "#0f172a" },
  subtitle: { margin: 0, color: "#334155", fontSize: 18, lineHeight: 1.75, maxWidth: 520 },
  ctaRow: { display: "flex", gap: 16, marginTop: 28, flexWrap: "wrap" },
  primaryBtn: { display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#1d4ed8", color: "#fff", padding: "14px 24px", borderRadius: 9999, textDecoration: "none", fontWeight: 700 },
  secondaryBtn: { display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", color: "#0f172a", padding: "14px 24px", borderRadius: 9999, textDecoration: "none", fontWeight: 700, border: "1px solid #cbd5e1" },
  heroCards: { display: "grid", gap: 20 },
  featureCard: { borderRadius: 28, overflow: "hidden", boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)", background: "#fff", display: "grid", gridTemplateRows: "220px auto" },
  featureImage: { width: "100%", height: "100%", objectFit: "cover" },
  featureCategory: { margin: 0, color: "#f59e0b", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.07em" },
  featureTitle: { margin: "12px 0 8px", fontSize: 20, color: "#0f172a" },
  featureDesc: { margin: 0, color: "#475569", lineHeight: 1.8 },
  section: { marginBottom: 48 },
  sectionHeader: { display: "grid", gap: 18, maxWidth: 680, marginBottom: 28 },
  sectionLabel: { margin: 0, color: "#f59e0b", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" },
  sectionTitle: { margin: 0, fontSize: "2rem", color: "#0f172a" },
  sectionCopy: { margin: 0, maxWidth: 720, color: "#475569", lineHeight: 1.75 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 },
  cardFeature: { background: "#fff", padding: 24, borderRadius: 24, boxShadow: "0 18px 60px rgba(15, 23, 42, 0.06)" },
  categoryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 18 },
  categoryCard: { overflow: "hidden", borderRadius: 24, background: "#fff", boxShadow: "0 18px 60px rgba(15, 23, 42, 0.06)" },
  categoryImage: { width: "100%", height: 160, objectFit: "cover" },
  categoryName: { margin: "16px 16px 8px", fontSize: 18, color: "#0f172a" },
  categoryText: { margin: "0 16px 16px", color: "#64748b", lineHeight: 1.75 },
};
