// pages/Customers.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectAllCustomers } from "../features/customerSlice";
import Layout from "../components/layout/Layout";

const Customers = () => {
  const customers = useSelector(selectAllCustomers);
  const [search,       setSearch]       = useState("");
  const [favModal,     setFavModal]     = useState(null);  // { customer, favorites[] }
  const [favLoading,   setFavLoading]   = useState(false);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  // ── Fetch customer favorites from backend ─────────────────────────────────
  const handleViewFavorites = async (customer) => {
    setFavModal({ customer, favorites: [] });
    setFavLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(
        `${import.meta.env.VITE_API_URL}/customers/${customer._id || customer.id}/favorites`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setFavModal({ customer, favorites: data.favorites || [] });
    } catch (err) {
      setFavModal({ customer, favorites: [] });
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <Layout>
      <div style={styles.page}>

        {/* ── Favorites Modal ──────────────────────────────────────────────── */}
        {favModal && (
          <div style={styles.modalOverlay} onClick={() => setFavModal(null)}>
            <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>

              {/* Modal Header */}
              <div style={styles.modalHeader}>
                <div>
                  <h2 style={styles.modalTitle}>
                    ❤️ {favModal.customer.name}'s Favorites
                  </h2>
                  <p style={styles.modalSub}>
                    {favLoading
                      ? "Loading…"
                      : `${favModal.favorites.length} saved product${favModal.favorites.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <button style={styles.closeBtn} onClick={() => setFavModal(null)}>✕</button>
              </div>

              {/* Loading */}
              {favLoading && (
                <div style={styles.modalEmpty}>
                  <span style={{ fontSize: 32 }}>⏳</span>
                  <p>Fetching favorites…</p>
                </div>
              )}

              {/* Empty */}
              {!favLoading && favModal.favorites.length === 0 && (
                <div style={styles.modalEmpty}>
                  <span style={{ fontSize: 48 }}>🤍</span>
                  <p style={{ color: "#6b7280", marginTop: 8 }}>
                    This customer hasn't saved any favorites yet.
                  </p>
                </div>
              )}

              {/* Favorites Grid */}
              {!favLoading && favModal.favorites.length > 0 && (
                <div style={styles.favGrid}>
                  {favModal.favorites.map((product) => {
                    const id       = product._id || product.id;
                    const discount = product.mrp && product.price < product.mrp
                      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                      : 0;
                    return (
                      <div key={id} style={styles.favCard}>
                        {/* Image */}
                        <div style={styles.favImgWrap}>
                          {product.image
                            ? <img src={product.image} alt={product.name} style={styles.favImg}
                                onError={(e) => { e.target.style.display = "none"; }} />
                            : <div style={styles.favImgPlaceholder}>📦</div>}
                          {product.offerLabel && (
                            <span style={styles.offerBadge}>{product.offerLabel}</span>
                          )}
                        </div>
                        {/* Info */}
                        <div style={styles.favInfo}>
                          <p style={styles.favCategory}>{product.category}</p>
                          <p style={styles.favName}>{product.name}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={styles.favPrice}>₹{product.price}</span>
                            {product.mrp > product.price && (
                              <span style={styles.favMrp}>₹{product.mrp}</span>
                            )}
                            {discount > 0 && (
                              <span style={styles.discountBadge}>{discount}% off</span>
                            )}
                          </div>
                          <span style={{
                            ...styles.stockBadge,
                            background: product.stock === 0 ? "#fee2e2" : product.stock < 5 ? "#fef3c7" : "#d1fae5",
                            color:      product.stock === 0 ? "#991b1b" : product.stock < 5 ? "#92400e" : "#065f46",
                          }}>
                            {product.stock === 0 ? "Out of Stock" : product.stock < 5 ? `Only ${product.stock} left` : "In Stock"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Modal Footer */}
              <div style={styles.modalFooter}>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>
                  Customer: {favModal.customer.email}
                </div>
                <button style={styles.doneBtn} onClick={() => setFavModal(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Customers</h1>
            <p style={styles.subtitle}>{customers.length} total customers</p>
          </div>
          <button style={styles.addBtn}>+ Add Customer</button>
        </div>

        {/* Search */}
        <div style={styles.searchWrap}>
          <input
            style={styles.search}
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Stats Row */}
        <div style={styles.statsRow}>
          <StatCard label="Total Customers" value={customers.length} icon="👥" />
          <StatCard
            label="Total Revenue"
            value={`₹${customers.reduce((s, c) => s + (c.totalSpent || 0), 0).toLocaleString()}`}
            icon="💰"
          />
          <StatCard
            label="Total Orders"
            value={customers.reduce((s, c) => s + (c.orders || 0), 0)}
            icon="📦"
          />
          <StatCard
            label="Avg. Spend"
            value={customers.length
              ? `₹${Math.round(customers.reduce((s, c) => s + (c.totalSpent || 0), 0) / customers.length).toLocaleString()}`
              : "₹0"}
            icon="📈"
          />
        </div>

        {/* Table */}
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["Customer", "Phone", "Orders", "Total Spent", "Favorites", "Joined", "Actions"].map(
                  (h) => <th key={h} style={styles.th}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const favCount = c.favorites?.length ?? "—";
                return (
                  <tr key={c._id || c.id} style={styles.tr}>
                    {/* Customer */}
                    <td style={styles.td}>
                      <div style={styles.customerCell}>
                        <div style={styles.avatar}>{c.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <div style={styles.name}>{c.name}</div>
                          <div style={styles.email}>{c.email}</div>
                        </div>
                      </div>
                    </td>

                    <td style={styles.td}>{c.phone || "—"}</td>

                    <td style={styles.td}>
                      <span style={styles.badge}>{c.orders || 0}</span>
                    </td>

                    <td style={styles.td}>
                      <strong>₹{(c.totalSpent || 0).toLocaleString()}</strong>
                    </td>

                    {/* Favorites count + view button */}
                    <td style={styles.td}>
                      <button
                        style={styles.favBtn}
                        onClick={() => handleViewFavorites(c)}
                        title="View this customer's favorites"
                      >
                        ❤️ {typeof favCount === "number" ? favCount : "View"}
                      </button>
                    </td>

                    <td style={styles.td}>{c.joined || "—"}</td>

                    <td style={styles.td}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button style={styles.viewBtn}>View</button>
                        <button
                          style={styles.favActionBtn}
                          onClick={() => handleViewFavorites(c)}
                        >
                          ❤️ Favorites
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div style={styles.empty}>No customers found.</div>
          )}
        </div>
      </div>
    </Layout>
  );
};

const StatCard = ({ label, value, icon }) => (
  <div style={styles.statCard}>
    <span style={styles.statIcon}>{icon}</span>
    <div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  </div>
);

const styles = {
  page:          { padding: "24px", fontFamily: "'Segoe UI', sans-serif", color: "#1a1a2e" },
  header:        { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" },
  title:         { fontSize: "26px", fontWeight: "700", margin: 0 },
  subtitle:      { color: "#6b7280", margin: "4px 0 0", fontSize: "14px" },
  addBtn:        { background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 18px", fontWeight: "600", cursor: "pointer", fontSize: "14px" },
  searchWrap:    { marginBottom: "20px" },
  search:        { width: "100%", maxWidth: "360px", padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none" },
  statsRow:      { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" },
  statCard:      { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
  statIcon:      { fontSize: "28px" },
  statValue:     { fontSize: "22px", fontWeight: "700", color: "#1a1a2e" },
  statLabel:     { fontSize: "12px", color: "#6b7280", marginTop: "2px" },
  tableWrap:     { background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
  table:         { width: "100%", borderCollapse: "collapse" },
  th:            { textAlign: "left", padding: "12px 16px", fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" },
  tr:            { borderBottom: "1px solid #f3f4f6", transition: "background 0.15s" },
  td:            { padding: "14px 16px", fontSize: "14px", verticalAlign: "middle" },
  customerCell:  { display: "flex", alignItems: "center", gap: "12px" },
  avatar:        { width: "38px", height: "38px", borderRadius: "50%", background: "#e0e7ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "15px", flexShrink: 0 },
  name:          { fontWeight: "600", color: "#1a1a2e" },
  email:         { fontSize: "12px", color: "#9ca3af", marginTop: "2px" },
  badge:         { background: "#ede9fe", color: "#6d28d9", borderRadius: "20px", padding: "3px 10px", fontSize: "13px", fontWeight: "600" },
  viewBtn:       { background: "transparent", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "6px 14px", cursor: "pointer", fontSize: "13px", color: "#4f46e5", fontWeight: "500" },
  favBtn:        { background: "#fce7f3", color: "#be185d", border: "none", borderRadius: "20px", padding: "4px 12px", fontSize: "13px", fontWeight: "700", cursor: "pointer" },
  favActionBtn:  { background: "#fce7f3", color: "#be185d", border: "none", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  empty:         { textAlign: "center", padding: "48px", color: "#9ca3af", fontSize: "15px" },
  // ── Modal ────────────────────────────────────────────────────────────────
  modalOverlay:  { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 },
  modalBox:      { background: "#fff", borderRadius: 16, width: "100%", maxWidth: 680, maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden" },
  modalHeader:   { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px 24px 16px", borderBottom: "1px solid #e5e7eb" },
  modalTitle:    { fontSize: 18, fontWeight: 700, margin: 0 },
  modalSub:      { fontSize: 13, color: "#6b7280", margin: "4px 0 0" },
  closeBtn:      { background: "#f3f4f6", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#6b7280", flexShrink: 0 },
  modalEmpty:    { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", flex: 1 },
  favGrid:       { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, padding: "16px 24px", overflowY: "auto", flex: 1 },
  favCard:       { border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", background: "#fafafa" },
  favImgWrap:    { position: "relative", height: 120, background: "#f3f4f6" },
  favImg:        { width: "100%", height: "100%", objectFit: "cover" },
  favImgPlaceholder: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 },
  offerBadge:    { position: "absolute", top: 6, left: 6, background: "#ef4444", color: "#fff", borderRadius: 4, padding: "2px 6px", fontSize: 10, fontWeight: 700 },
  favInfo:       { padding: "10px 12px", display: "flex", flexDirection: "column", gap: 4 },
  favCategory:   { fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0, fontWeight: 600 },
  favName:       { fontSize: 13, fontWeight: 700, color: "#1a1a2e", margin: 0, lineHeight: 1.3 },
  favPrice:      { fontSize: 15, fontWeight: 800, color: "#1a1a2e" },
  favMrp:        { fontSize: 12, color: "#9ca3af", textDecoration: "line-through" },
  discountBadge: { background: "#d1fae5", color: "#065f46", borderRadius: 4, padding: "1px 6px", fontSize: 10, fontWeight: 700 },
  stockBadge:    { borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 600, width: "fit-content", marginTop: 2 },
  modalFooter:   { padding: "14px 24px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" },
  doneBtn:       { background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 600, cursor: "pointer", fontSize: 13 },
};

export default Customers;