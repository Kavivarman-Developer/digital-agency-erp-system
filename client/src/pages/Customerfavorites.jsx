// pages/Customerfavorites.jsx  (or customer/CustomerFavorites.jsx)
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loadSettings } from "./Settings";

const API = import.meta.env.VITE_API_URL.replace("/api", "");

// ── API helpers ───────────────────────────────────────────────────────────────
const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const fetchMyFavorites = async () => {
  const res = await fetch(`${API}/api/customers/me/favorites`, { headers: authHeader() });
  if (!res.ok) throw new Error("Failed to fetch favorites");
  return res.json(); // returns Product[]
};

export const toggleFavoriteAPI = async (productId) => {
  const res = await fetch(`${API}/api/customers/me/favorites/${productId}`, {
    method: "POST",
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to toggle favorite");
  return res.json(); // { favorites: Product[], action: "added"|"removed" }
};

export const clearFavoritesAPI = async () => {
  const res = await fetch(`${API}/api/customers/me/favorites`, {
    method: "DELETE",
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to clear favorites");
  return res.json();
};

// ── Helper: check if a product is favorited (used by other pages) ─────────────
export const isFavoriteId = (favorites, productId) =>
  favorites.some((f) => (f._id || f) === productId);

// ─────────────────────────────────────────────────────────────────────────────
const CustomerFavorites = () => {
  const navigate = useNavigate();
  const [favorites,   setFavorites]   = useState([]);   // Product objects from DB
  const [loading,     setLoading]     = useState(true);
  const [toggling,    setToggling]    = useState({});   // productId → true while toggling
  const [addedToCart, setAddedToCart] = useState({});
  const [cartItems,   setCartItems]   = useState(() => {
    try { return JSON.parse(localStorage.getItem("qs_cart")) || []; }
    catch { return []; }
  });
  const [error, setError] = useState("");

  // ── Guard: Settings shop_wishlist must be ON ─────────────────────────────
  useEffect(() => {
    const settings = loadSettings();
    if (!settings.shop_wishlist) navigate("/shop");
  }, [navigate]);

  // ── Fetch favorites from backend ─────────────────────────────────────────
  const loadFavorites = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMyFavorites();
      setFavorites(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Could not load favorites. Please try again.");
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFavorites(); }, [loadFavorites]);

  // ── Toggle remove from favorites ──────────────────────────────────────────
  const handleRemoveFavorite = async (productId) => {
    setToggling((prev) => ({ ...prev, [productId]: true }));
    try {
      const data = await toggleFavoriteAPI(productId);
      setFavorites(data.favorites || []);
    } catch {
      setError("Failed to remove. Please try again.");
    } finally {
      setToggling((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // ── Clear all favorites ───────────────────────────────────────────────────
  const handleClearAll = async () => {
    if (!window.confirm("Remove all favorites?")) return;
    try {
      await clearFavoritesAPI();
      setFavorites([]);
    } catch {
      setError("Failed to clear. Please try again.");
    }
  };

  // ── Add to cart (localStorage cart) ──────────────────────────────────────
  const handleAddToCart = (product) => {
    const cart     = JSON.parse(localStorage.getItem("qs_cart")) || [];
    const existing = cart.find((i) => i._id === product._id);
    const updated  = existing
      ? cart.map((i) => i._id === product._id ? { ...i, qty: i.qty + 1 } : i)
      : [...cart, { ...product, qty: 1 }];
    localStorage.setItem("qs_cart", JSON.stringify(updated));
    setCartItems(updated);
    setAddedToCart((prev) => ({ ...prev, [product._id]: true }));
    setTimeout(() => {
      setAddedToCart((prev) => ({ ...prev, [product._id]: false }));
    }, 1500);
  };

  const totalCartItems = cartItems.reduce((sum, i) => sum + (i.qty || 1), 0);

  return (
    <div style={s.page}>

      {/* ── Top Nav ─────────────────────────────────────────────────────── */}
      <nav style={s.nav}>
        <Link to="/shop" style={s.logo}>🛍️ QuickShop</Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link to="/shop"           style={s.navLink}>Shop</Link>
          <Link to="/shop/orders"    style={s.navLink}>Orders</Link>
          <Link to="/shop/favorites" style={{ ...s.navLink, color: "#e11d48", fontWeight: 700 }}>
            ❤️ Favorites {favorites.length > 0 && <span style={s.favCount}>{favorites.length}</span>}
          </Link>
          <Link to="/shop/cart" style={s.cartBtn}>
            🛒 Cart {totalCartItems > 0 && <span style={s.cartBadge}>{totalCartItems}</span>}
          </Link>
        </div>
      </nav>

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>❤️ My Favorites</h1>
          <p style={s.subtitle}>
            {loading
              ? "Loading…"
              : favorites.length === 0
              ? "No favourites yet — heart a product to save it here"
              : `${favorites.length} saved product${favorites.length > 1 ? "s" : ""}`}
          </p>
        </div>
        {favorites.length > 0 && !loading && (
          <button style={s.clearBtn} onClick={handleClearAll}>🗑 Clear All</button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px 24px", borderRadius: 8, margin: "0 24px 16px", fontSize: 13, fontWeight: 600 }}>
          ⚠️ {error}
          <button style={{ marginLeft: 12, background: "none", border: "none", color: "#991b1b", cursor: "pointer", fontWeight: 700 }} onClick={loadFavorites}>Retry</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={s.emptyState}>
          <span style={{ fontSize: 40 }}>⏳</span>
          <p>Loading your favorites…</p>
        </div>
      )}

      {/* Empty */}
      {!loading && favorites.length === 0 && !error && (
        <div style={s.emptyState}>
          <span style={{ fontSize: 64 }}>🤍</span>
          <h2 style={{ margin: "12px 0 6px", fontSize: 20 }}>No Favorites Yet</h2>
          <p style={{ color: "#6b7280", margin: "0 0 20px" }}>
            Browse the shop and tap ❤️ to save products here.
          </p>
          <Link to="/shop" style={s.shopNowBtn}>Browse Shop →</Link>
        </div>
      )}

      {/* ── Product Grid ──────────────────────────────────────────────── */}
      {!loading && favorites.length > 0 && (
        <div style={s.grid}>
          {favorites.map((product) => {
            const id         = product._id || product.id;
            const discount   = product.mrp && product.price < product.mrp
              ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
            const isAdded    = !!addedToCart[id];
            const outOfStock = product.stock === 0;
            const isRemoving = !!toggling[id];

            return (
              <div key={id} style={{ ...s.card, opacity: isRemoving ? 0.5 : 1, transition: "opacity 0.3s" }}>
                {/* Image */}
                <div style={s.imgWrap}>
                  {product.image
                    ? <img src={product.image} alt={product.name} style={s.img}
                        onError={(e) => { e.target.style.display = "none"; }} />
                    : <div style={s.imgPlaceholder}>📦</div>}

                  {product.offerLabel && <span style={s.offerBadge}>{product.offerLabel}</span>}
                  {!product.offerLabel && discount > 0 && <span style={s.offerBadge}>{discount}% OFF</span>}

                  {/* Heart remove button */}
                  <button
                    style={s.heartBtn}
                    onClick={() => !isRemoving && handleRemoveFavorite(id)}
                    title="Remove from favorites"
                    disabled={isRemoving}
                  >
                    {isRemoving ? "⏳" : "❤️"}
                  </button>
                </div>

                {/* Info */}
                <div style={s.cardBody}>
                  <p style={s.category}>{product.category}</p>
                  <h3 style={s.productName}>{product.name}</h3>

                  <div style={s.priceRow}>
                    <span style={s.price}>₹{product.price}</span>
                    {product.mrp > product.price && <span style={s.mrp}>₹{product.mrp}</span>}
                    {discount > 0 && <span style={s.discountBadge}>{discount}% off</span>}
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    {outOfStock
                      ? <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 600 }}>❌ Out of Stock</span>
                      : product.stock < 5
                      ? <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 600 }}>⚠️ Only {product.stock} left</span>
                      : <span style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>✅ In Stock</span>}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      style={{
                        ...s.cartBtn2,
                        background: isAdded ? "#059669" : outOfStock ? "#d1d5db" : "#4f46e5",
                        cursor: outOfStock ? "not-allowed" : "pointer",
                        flex: 1,
                      }}
                      onClick={() => !outOfStock && handleAddToCart(product)}
                      disabled={outOfStock}
                    >
                      {isAdded ? "✓ Added!" : outOfStock ? "Out of Stock" : "Add to Cart"}
                    </button>
                    <button
                      style={{ ...s.removeBtn, opacity: isRemoving ? 0.5 : 1 }}
                      onClick={() => !isRemoving && handleRemoveFavorite(id)}
                      disabled={isRemoving}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Continue Shopping */}
      {!loading && favorites.length > 0 && (
        <div style={{ textAlign: "center", marginTop: 40, paddingBottom: 40 }}>
          <Link to="/shop" style={s.shopNowBtn}>← Continue Shopping</Link>
        </div>
      )}
    </div>
  );
};

const s = {
  page:         { minHeight: "100vh", background: "#f9fafb", fontFamily: "'Segoe UI', sans-serif" },
  nav:          { background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 },
  logo:         { fontSize: 20, fontWeight: 800, color: "#4f46e5", textDecoration: "none" },
  navLink:      { color: "#6b7280", textDecoration: "none", fontWeight: 500, fontSize: 14, display: "flex", alignItems: "center", gap: 4 },
  favCount:     { background: "#e11d48", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" },
  cartBtn:      { background: "#4f46e5", color: "#fff", textDecoration: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6 },
  cartBadge:    { background: "#ef4444", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" },
  header:       { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "28px 24px 16px", maxWidth: 1200, margin: "0 auto", flexWrap: "wrap", gap: 12 },
  title:        { fontSize: 26, fontWeight: 800, margin: 0, color: "#1a1a2e" },
  subtitle:     { color: "#6b7280", margin: "4px 0 0", fontSize: 14 },
  clearBtn:     { background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 },
  emptyState:   { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", textAlign: "center" },
  shopNowBtn:   { background: "#4f46e5", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "12px 28px", fontWeight: 700, fontSize: 15, display: "inline-block" },
  grid:         { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20, padding: "16px 24px 40px", maxWidth: 1200, margin: "0 auto" },
  card:         { background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6" },
  imgWrap:      { position: "relative", height: 200, background: "#f9fafb", overflow: "hidden" },
  img:          { width: "100%", height: "100%", objectFit: "cover" },
  imgPlaceholder: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, background: "#f3f4f6" },
  offerBadge:   { position: "absolute", top: 10, left: 10, background: "#ef4444", color: "#fff", borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700 },
  heartBtn:     { position: "absolute", top: 10, right: 10, background: "#fff", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center" },
  cardBody:     { padding: "14px 16px 16px" },
  category:     { fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px", fontWeight: 600 },
  productName:  { fontSize: 15, fontWeight: 700, margin: "0 0 8px", color: "#1a1a2e", lineHeight: 1.3 },
  priceRow:     { display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" },
  price:        { fontSize: 18, fontWeight: 800, color: "#1a1a2e" },
  mrp:          { fontSize: 13, color: "#9ca3af", textDecoration: "line-through" },
  discountBadge:{ background: "#d1fae5", color: "#065f46", borderRadius: 4, padding: "2px 7px", fontSize: 11, fontWeight: 700 },
  cartBtn2:     { color: "#fff", border: "none", borderRadius: 8, padding: "9px 14px", fontWeight: 700, fontSize: 13, transition: "background 0.2s" },
  removeBtn:    { background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 8, padding: "9px 12px", cursor: "pointer", fontSize: 15 },
};

export default CustomerFavorites;