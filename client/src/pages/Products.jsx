// pages/Products.jsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAllProducts, selectLowStock, selectProductsLoading,
  fetchAllProducts, createProductAPI, updateProductAPI, deleteProductAPI,
} from "../features/productSlice";
import Layout from "../components/layout/Layout";
import { loadSettings, PRODUCT_LIMIT_FREE } from "./Settings";

const CATEGORIES = ["All", "Accessories", "Clothing", "Footwear"];

const emptyForm = {
  name: "", sku: "", price: "", mrp: "", stock: "",
  category: "Accessories", image: "", status: "active",
  offerLabel: "",
};

const Products = () => {
  const dispatch = useDispatch();
  const products = useSelector(selectAllProducts);
  const lowStock = useSelector(selectLowStock);
  const loading = useSelector(selectProductsLoading);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [imgPreview, setImgPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // ── Read settings on every render (so Settings changes reflect immediately) ─
  const settings = loadSettings();
  const unlimitedProducts = !!settings.prod_unlimitedProducts;
  const showOfferLabel = !!settings.prod_offerLabel;
  const showLowStockAlert = !!settings.prod_lowStockAlert;

  // Product limit logic
  const productLimit = unlimitedProducts ? Infinity : PRODUCT_LIMIT_FREE;
  const isAtLimit = !unlimitedProducts && products.length >= PRODUCT_LIMIT_FREE;
  const nearLimit = !unlimitedProducts && products.length >= PRODUCT_LIMIT_FREE - 5;

  useEffect(() => { dispatch(fetchAllProducts()); }, [dispatch]);

  // ── Image upload → Cloudinary ──────────────────────────────────────────────
  const handleImageFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImgPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const data = new FormData();
      data.append("image", file);
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      if (!res.ok) throw new Error("Upload failed");
      const json = await res.json();
      setForm((f) => ({ ...f, image: json.url }));
      setImgPreview(json.url);
    } catch (err) {
      alert("Image upload failed: " + err.message);
      setImgPreview(""); setForm((f) => ({ ...f, image: "" }));
    } finally { setUploading(false); }
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    return matchSearch && matchCat;
  });

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // ── Open Add Form — check limit first ────────────────────────────────────
  const handleOpenAdd = () => {
    if (isAtLimit) {
      setShowLimitModal(true);
      return;
    }
    setShowForm(true); setEditItem(null); setForm(emptyForm); setImgPreview("");
  };

  const handleSubmit = async () => {
    if (!form.name || !form.sku || !form.price) return alert("Name, SKU, Price required");
    // Double-check limit on submit too (safety)
    if (!editItem && isAtLimit) { setShowLimitModal(true); return; }
    setSaving(true);
    try {
      if (editItem) {
        await dispatch(updateProductAPI({ id: editItem._id || editItem.id, ...form })).unwrap();
      } else {
        await dispatch(createProductAPI(form)).unwrap();
      }
      setForm(emptyForm); setImgPreview(""); setShowForm(false); setEditItem(null);
    } catch (err) {
      alert(err || "Failed to save product");
    } finally { setSaving(false); }
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name, sku: p.sku, price: p.price, mrp: p.mrp ?? "",
      stock: p.stock, category: p.category, image: p.image || "",
      status: p.status || "active",
      offerLabel: p.offerLabel || "",
    });
    setImgPreview(p.image || "");
    setEditItem(p); setShowForm(true);
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    try { await dispatch(deleteProductAPI(p._id || p.id)).unwrap(); }
    catch (err) { alert(err || "Failed to delete product"); }
  };

  return (
    <Layout>
      <div style={s.page}>

        {/* ── Premium Upgrade Modal ──────────────────────────────────────────── */}
        {showLimitModal && (
          <div style={s.modalOverlay} onClick={() => setShowLimitModal(false)}>
            <div style={s.modalBox} onClick={(e) => e.stopPropagation()}>
              <div style={{ fontSize: 48, textAlign: "center", marginBottom: 12 }}>🔒</div>
              <h2 style={{ margin: "0 0 8px", fontSize: 20, textAlign: "center" }}>Product Limit Reached</h2>
              <p style={{ color: "#6b7280", fontSize: 14, textAlign: "center", margin: "0 0 20px" }}>
                You've reached the <strong>{PRODUCT_LIMIT_FREE}-product limit</strong> on the Free plan.
                Enable <strong>"Unlimited Products"</strong> in Settings to add more.
              </p>
              <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
                <p style={{ margin: 0, fontSize: 13, color: "#92400e", fontWeight: 600 }}>
                  📦 Current: {products.length} / {PRODUCT_LIMIT_FREE} products
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#92400e" }}>
                  Go to Settings → 📦 Products → Enable "Unlimited Products" (Premium)
                </p>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button style={s.cancelBtn} onClick={() => setShowLimitModal(false)}>
                  Cancel
                </button>
                <button
                  style={{ ...s.upgradeBtn }}
                  onClick={() => { setShowLimitModal(false); window.location.href = "/settings"; }}
                >
                  ✨ Go to Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Products</h1>
            <p style={s.subtitle}>{products.length} total products</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Limit badge */}
            {!unlimitedProducts && (
              <div style={{
                background: isAtLimit ? "#fee2e2" : nearLimit ? "#fef3c7" : "#f0fdf4",
                color: isAtLimit ? "#991b1b" : nearLimit ? "#92400e" : "#065f46",
                border: `1px solid ${isAtLimit ? "#fca5a5" : nearLimit ? "#fde68a" : "#bbf7d0"}`,
                borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 700,
              }}>
                {isAtLimit ? "🔒 Limit Reached" : `📦 ${products.length} / ${PRODUCT_LIMIT_FREE}`}
              </div>
            )}
            {unlimitedProducts && (
              <div style={{ background: "#f0fdf4", color: "#065f46", border: "1px solid #bbf7d0", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 700 }}>
                ✅ Unlimited
              </div>
            )}
            <button
              style={{ ...s.addBtn, opacity: isAtLimit ? 0.6 : 1 }}
              onClick={handleOpenAdd}
            >
              {isAtLimit ? "🔒 Limit Reached" : "+ Add Product"}
            </button>
          </div>
        </div>

        {/* Near-limit warning bar */}
        {nearLimit && !isAtLimit && (
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ margin: 0, fontSize: 13, color: "#92400e", fontWeight: 600 }}>
              ⚠️ Almost at limit — {products.length}/{PRODUCT_LIMIT_FREE} products used.
              {" "}<span style={{ fontWeight: 400 }}>Enable "Unlimited Products" in Settings to continue.</span>
            </p>
            <button
              style={{ background: "#f59e0b", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
              onClick={() => window.location.href = "/settings"}
            >
              ✨ Upgrade
            </button>
          </div>
        )}

        {/* At-limit warning bar */}
        {isAtLimit && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "10px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ margin: 0, fontSize: 13, color: "#991b1b", fontWeight: 600 }}>
              🔒 Product limit reached ({PRODUCT_LIMIT_FREE}/{PRODUCT_LIMIT_FREE}).
              {" "}<span style={{ fontWeight: 400 }}>Enable "Unlimited Products" in Settings to add more.</span>
            </p>
            <button
              style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
              onClick={() => window.location.href = "/settings"}
            >
              ✨ Go to Settings
            </button>
          </div>
        )}

        {/* Low Stock Alert (only if feature enabled) */}
        {showLowStockAlert && lowStock.length > 0 && (
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 16px", marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#92400e", fontWeight: 600 }}>
              ⚠️ Low Stock Alert: {lowStock.length} product(s) have stock below 5 units.
            </p>
          </div>
        )}

        {/* Stats */}
        <div style={s.statsRow}>
          <StatCard label="Total" value={products.length} icon="📦" color="#e0e7ff" />
          <StatCard label="Active" value={products.filter(p => p.status === "active").length} icon="✅" color="#d1fae5" />
          <StatCard label="Low Stock" value={lowStock.length} icon="⚠️" color="#fef3c7" />
          <StatCard label="Out of Stock" value={products.filter(p => p.stock === 0).length} icon="❌" color="#fee2e2" />
        </div>

        {/* Filters */}
        <div style={s.toolbar}>
          <div style={s.filterTabs}>
            {CATEGORIES.map((c) => (
              <button key={c}
                style={{ ...s.tab, ...(category === c ? s.tabActive : {}) }}
                onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>
          <input style={s.search} placeholder="Search by name or SKU…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {/* ── Add / Edit Form ─────────────────────────────────────────────── */}
        {showForm && (
          <div style={s.formCard}>
            <h3 style={s.formTitle}>{editItem ? "Edit Product" : "Add New Product"}</h3>

            <div style={s.formGrid}>
              {/* Product Name */}
              <div style={s.formGroup}>
                <label style={s.label}>Product Name *</label>
                <input style={s.input} name="name" value={form.name} onChange={handleChange} placeholder="e.g. Gaming Chair" />
              </div>

              {/* SKU */}
              <div style={s.formGroup}>
                <label style={s.label}>SKU *</label>
                <input style={s.input} name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. CHAIR-001" />
              </div>

              {/* Price */}
              <div style={s.formGroup}>
                <label style={s.label}>Price (₹) *</label>
                <input style={s.input} name="price" type="number" value={form.price} onChange={handleChange} placeholder="e.g. 4999" />
              </div>

              {/* MRP */}
              <div style={s.formGroup}>
                <label style={s.label}>MRP (₹)</label>
                <input style={s.input} name="mrp" type="number" value={form.mrp} onChange={handleChange} placeholder="e.g. 6999" />
              </div>

              {/* Stock */}
              <div style={s.formGroup}>
                <label style={s.label}>Stock</label>
                <input style={s.input} name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="e.g. 100" />
              </div>

              {/* Category */}
              <div style={s.formGroup}>
                <label style={s.label}>Category</label>
                <select style={s.input} name="category" value={form.category} onChange={handleChange}>
                  {["Accessories", "Clothing", "Footwear"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div style={s.formGroup}>
                <label style={s.label}>Status</label>
                <select style={s.input} name="status" value={form.status} onChange={handleChange}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Offer Label — only if feature enabled */}
              {showOfferLabel && (
                <div style={s.formGroup}>
                  <label style={s.label}>Offer Label <span style={{ color: "#059669", fontSize: 10, fontWeight: 700 }}>FREE</span></label>
                  <input style={s.input} name="offerLabel" value={form.offerLabel} onChange={handleChange} placeholder='e.g. "17% OFF" / "NEW"' />
                </div>
              )}

              {/* Image */}
              <div style={{ ...s.formGroup, gridColumn: "1 / -1" }}>
                <label style={s.label}>Product Image</label>
                <div style={s.imageRow}>
                  <label style={s.uploadBox}>
                    <span style={{ fontSize: 22 }}>📁</span>
                    <span style={{ fontSize: 11, color: "#6b7280" }}>{uploading ? "Uploading…" : "Upload"}</span>
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageFile} disabled={uploading} />
                  </label>
                  <input
                    style={{ ...s.input, flex: 1 }}
                    placeholder="Paste Image URL"
                    value={form.image.startsWith("data:") ? "" : form.image}
                    onChange={(e) => { setForm(f => ({ ...f, image: e.target.value })); setImgPreview(e.target.value); }}
                  />
                  {imgPreview && (
                    <div style={s.previewWrap}>
                      <img src={imgPreview} alt="preview" style={s.previewImg} onError={() => setImgPreview("")} />
                      <button style={s.removeImg} onClick={() => { setForm(f => ({ ...f, image: "" })); setImgPreview(""); }}>✕</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div style={s.formActions}>
              <button style={s.cancelBtn} onClick={() => { setShowForm(false); setEditItem(null); setImgPreview(""); }}>Cancel</button>
              <button style={{ ...s.saveBtn, opacity: saving || uploading ? 0.7 : 1 }}
                onClick={handleSubmit} disabled={saving || uploading}>
                {saving ? "Saving…" : editItem ? "Update" : "Add Product"}
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && <div style={{ textAlign: "center", padding: 48, color: "#6b7280" }}>Loading products…</div>}

        {/* Table */}
        {!loading && (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["", "Product", "SKU", "Category", "Price", "MRP",
                    ...(showOfferLabel ? ["Offer"] : []),
                    "Stock", "Status", "Actions"
                  ].map((h, i) => (
                    <th key={i} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id || p.id} style={s.tr}>
                    <td style={s.td}>
                      {p.image
                        ? <img src={p.image} alt={p.name} style={s.thumb} onError={(e) => { e.target.style.display = "none"; }} />
                        : <div style={s.thumbPlaceholder}>📦</div>}
                    </td>
                    <td style={s.td}><strong>{p.name}</strong></td>
                    <td style={s.td}><code style={s.sku}>{p.sku}</code></td>
                    <td style={s.td}>{p.category}</td>
                    <td style={s.td}><strong>₹{p.price}</strong></td>
                    <td style={s.td}><span style={s.mrp}>₹{p.mrp || "—"}</span></td>

                    {/* Offer Label column — only if feature enabled */}
                    {showOfferLabel && (
                      <td style={s.td}>
                        {p.offerLabel
                          ? <span style={{ background: "#ff6161", color: "#fff", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{p.offerLabel}</span>
                          : <span style={{ color: "#d1d5db", fontSize: 12 }}>—</span>}
                      </td>
                    )}

                    <td style={s.td}>
                      <span style={{
                        ...s.stockBadge,
                        background: p.stock === 0 ? "#fee2e2" : p.stock < 5 ? "#fef3c7" : "#d1fae5",
                        color: p.stock === 0 ? "#991b1b" : p.stock < 5 ? "#92400e" : "#065f46",
                      }}>
                        {p.stock === 0 ? "Out of Stock" : `${p.stock} units`}
                      </span>
                    </td>
                    <td style={s.td}>
                      <span style={{
                        ...s.statusBadge,
                        background: p.status === "active" ? "#d1fae5" : "#f3f4f6",
                        color: p.status === "active" ? "#065f46" : "#6b7280",
                      }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={s.td}>
                      <div style={s.actions}>
                        <button style={s.editBtn} onClick={() => handleEdit(p)}>Edit</button>
                        <button style={s.deleteBtn} onClick={() => handleDelete(p)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div style={s.empty}>No products found.</div>}
          </div>
        )}
      </div>
    </Layout>
  );
};

const StatCard = ({ label, value, icon, color }) => (
  <div style={{ ...s.statCard, background: color }}>
    <span style={s.statIcon}>{icon}</span>
    <div><div style={s.statValue}>{value}</div><div style={s.statLabel}>{label}</div></div>
  </div>
);

const s = {
  page: { padding: "24px", fontFamily: "'Segoe UI', sans-serif", color: "#1a1a2e" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: 12 },
  title: { fontSize: "26px", fontWeight: "700", margin: 0 },
  subtitle: { color: "#6b7280", margin: "4px 0 0", fontSize: "14px" },
  addBtn: { background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 18px", fontWeight: "600", cursor: "pointer", fontSize: "14px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "20px" },
  statCard: { borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px" },
  statIcon: { fontSize: "26px" },
  statValue: { fontSize: "22px", fontWeight: "700" },
  statLabel: { fontSize: "12px", color: "#6b7280", marginTop: "2px" },
  toolbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", gap: "12px", flexWrap: "wrap" },
  filterTabs: { display: "flex", gap: "8px" },
  tab: { padding: "7px 16px", borderRadius: "20px", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: "500", color: "#6b7280" },
  tabActive: { background: "#4f46e5", color: "#fff", border: "1px solid #4f46e5" },
  search: { padding: "9px 14px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", minWidth: "220px" },
  formCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
  formTitle: { margin: "0 0 16px", fontSize: "16px", fontWeight: "700" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "12px", fontWeight: "600", color: "#6b7280" },
  input: { padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", fontFamily: "inherit" },
  formActions: { display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "16px" },
  cancelBtn: { background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "8px", padding: "9px 20px", cursor: "pointer", fontWeight: "600" },
  saveBtn: { background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", padding: "9px 20px", cursor: "pointer", fontWeight: "600" },
  upgradeBtn: { background: "#7c3aed", color: "#fff", border: "none", borderRadius: "8px", padding: "9px 20px", cursor: "pointer", fontWeight: "700", fontSize: 14 },
  imageRow: { display: "flex", alignItems: "flex-start", gap: "12px", marginTop: "6px", flexWrap: "wrap" },
  uploadBox: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", border: "2px dashed #e5e7eb", borderRadius: "10px", padding: "14px 20px", cursor: "pointer", minWidth: "110px", background: "#fafafa" },
  previewWrap: { position: "relative", flexShrink: 0 },
  previewImg: { width: "72px", height: "72px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e5e7eb" },
  removeImg: { position: "absolute", top: "-6px", right: "-6px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "50%", width: "18px", height: "18px", fontSize: "10px", cursor: "pointer" },
  tableWrap: { background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 16px", fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" },
  tr: { borderBottom: "1px solid #f3f4f6" },
  td: { padding: "13px 16px", fontSize: "14px", verticalAlign: "middle" },
  sku: { background: "#f3f4f6", padding: "3px 8px", borderRadius: "4px", fontSize: "12px" },
  mrp: { textDecoration: "line-through", color: "#9ca3af" },
  stockBadge: { borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: "600" },
  statusBadge: { borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: "600" },
  actions: { display: "flex", gap: "8px" },
  editBtn: { background: "#ede9fe", color: "#6d28d9", border: "none", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  deleteBtn: { background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  empty: { textAlign: "center", padding: "48px", color: "#9ca3af", fontSize: "15px" },
  thumb: { width: "44px", height: "44px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e5e7eb" },
  thumbPlaceholder: { width: "44px", height: "44px", borderRadius: "8px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" },
  // Modal
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalBox: { background: "#fff", borderRadius: 16, padding: "32px 28px", maxWidth: 400, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" },
};

export default Products;