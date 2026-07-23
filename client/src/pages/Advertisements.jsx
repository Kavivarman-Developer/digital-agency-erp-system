// pages/Advertisements.jsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAllAds,
  selectAdsLoading,
  fetchAllAds,
  createAdAPI,
  updateAdAPI,
  deleteAdAPI,
} from "../features/Advertisementslice";
import Layout from "../components/layout/Layout";

const POSITIONS = ["hero", "top-banner", "mid-banner", "popup"];
const STATUSES  = ["active", "inactive", "scheduled"];

// ─────────────────────────────────────────────────────────────────────────────
const emptyForm = {
  title: "", subtitle: "", description: "",
  bannerImage: "", ctaText: "Shop Now", ctaLink: "",
  offerText: "", badgeText: "",
  position: "hero", status: "active", priority: 0,
  startDate: "", endDate: "",
  seo: {
    metaTitle: "", metaDescription: "",
    keywords: "", // comma-separated string → convert to array on save
    ogTitle: "", ogDescription: "", ogImage: "",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
const Advertisements = () => {
  const dispatch = useDispatch();
  const ads      = useSelector(selectAllAds);
  const loading  = useSelector(selectAdsLoading);

  const [showForm,    setShowForm]    = useState(false);
  const [editItem,    setEditItem]    = useState(null);
  const [form,        setForm]        = useState(emptyForm);
  const [imgPreview,  setImgPreview]  = useState("");
  const [uploading,   setUploading]   = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [activeTab,   setActiveTab]   = useState("basic"); // "basic" | "seo"
  const [filterPos,   setFilterPos]   = useState("All");

  useEffect(() => {
    dispatch(fetchAllAds());
  }, [dispatch]);

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = filterPos === "All"
    ? ads
    : ads.filter((a) => a.position === filterPos);

  // ── Banner image upload (reuses /api/upload — same as Products.jsx) ────────
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImgPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const data  = new FormData();
      data.append("image", file);
      const token = localStorage.getItem("token");
      const res   = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      if (!res.ok) throw new Error("Upload failed");
      const json = await res.json();
      setForm((f) => ({ ...f, bannerImage: json.url }));
      setImgPreview(json.url);
    } catch (err) {
      alert("Image upload failed: " + err.message);
      setImgPreview("");
      setForm((f) => ({ ...f, bannerImage: "" }));
    } finally {
      setUploading(false);
    }
  };

  // ── Form field change ──────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSeoChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, seo: { ...f.seo, [name]: value } }));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.title.trim()) return alert("Title is required");
    setSaving(true);
    try {
      // Convert keywords string → array
      const payload = {
        ...form,
        priority: Number(form.priority) || 0,
        startDate: form.startDate || null,
        endDate:   form.endDate   || null,
        seo: {
          ...form.seo,
          keywords: form.seo.keywords
            ? form.seo.keywords.split(",").map((k) => k.trim()).filter(Boolean)
            : [],
          // ogImage defaults to bannerImage if not set
          ogImage: form.seo.ogImage || form.bannerImage,
        },
      };

      if (editItem) {
        await dispatch(updateAdAPI({ id: editItem._id, ...payload })).unwrap();
      } else {
        await dispatch(createAdAPI(payload)).unwrap();
      }
      resetForm();
    } catch (err) {
      alert(err || "Failed to save advertisement");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (ad) => {
    setForm({
      title:       ad.title       || "",
      subtitle:    ad.subtitle    || "",
      description: ad.description || "",
      bannerImage: ad.bannerImage || "",
      ctaText:     ad.ctaText     || "Shop Now",
      ctaLink:     ad.ctaLink     || "",
      offerText:   ad.offerText   || "",
      badgeText:   ad.badgeText   || "",
      position:    ad.position    || "hero",
      status:      ad.status      || "active",
      priority:    ad.priority    ?? 0,
      startDate:   ad.startDate ? ad.startDate.slice(0, 10) : "",
      endDate:     ad.endDate   ? ad.endDate.slice(0, 10)   : "",
      seo: {
        metaTitle:       ad.seo?.metaTitle       || "",
        metaDescription: ad.seo?.metaDescription || "",
        keywords:        (ad.seo?.keywords || []).join(", "),
        ogTitle:         ad.seo?.ogTitle         || "",
        ogDescription:   ad.seo?.ogDescription   || "",
        ogImage:         ad.seo?.ogImage         || "",
      },
    });
    setImgPreview(ad.bannerImage || "");
    setEditItem(ad);
    setShowForm(true);
    setActiveTab("basic");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (ad) => {
    if (!window.confirm(`Delete "${ad.title}"?`)) return;
    try {
      await dispatch(deleteAdAPI(ad._id)).unwrap();
    } catch (err) {
      alert(err || "Failed to delete");
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImgPreview("");
    setShowForm(false);
    setEditItem(null);
    setActiveTab("basic");
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div style={styles.page}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Advertisements</h1>
            <p style={styles.subtitle}>{ads.length} total banners</p>
          </div>
          <button
            style={styles.addBtn}
            onClick={() => { resetForm(); setShowForm(true); }}
          >
            + New Advertisement
          </button>
        </div>

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <div style={styles.statsRow}>
          <StatCard label="Total"     value={ads.length}                                   icon="📢" color="#e0e7ff" />
          <StatCard label="Active"    value={ads.filter(a => a.status === "active").length} icon="✅" color="#d1fae5" />
          <StatCard label="Inactive"  value={ads.filter(a => a.status === "inactive").length} icon="⏸️" color="#f3f4f6" />
          <StatCard label="Scheduled" value={ads.filter(a => a.status === "scheduled").length} icon="🕐" color="#fef3c7" />
        </div>

        {/* ── Position Filter ─────────────────────────────────────────────── */}
        <div style={styles.toolbar}>
          <div style={styles.filterTabs}>
            {["All", ...POSITIONS].map((pos) => (
              <button
                key={pos}
                style={{ ...styles.tab, ...(filterPos === pos ? styles.tabActive : {}) }}
                onClick={() => setFilterPos(pos)}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* ── Add / Edit Form ─────────────────────────────────────────────── */}
        {showForm && (
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <h3 style={styles.formTitle}>
                {editItem ? "✏️ Edit Advertisement" : "➕ New Advertisement"}
              </h3>
              {/* Tab switcher */}
              <div style={styles.tabSwitch}>
                <button
                  style={{ ...styles.tabBtn, ...(activeTab === "basic" ? styles.tabBtnActive : {}) }}
                  onClick={() => setActiveTab("basic")}
                >
                  Basic Info
                </button>
                <button
                  style={{ ...styles.tabBtn, ...(activeTab === "seo" ? styles.tabBtnActive : {}) }}
                  onClick={() => setActiveTab("seo")}
                >
                  SEO Settings
                </button>
              </div>
            </div>

            {/* ── BASIC TAB ─────────────────────────────────────────────── */}
            {activeTab === "basic" && (
              <>
                <div style={styles.formGrid}>
                  {/* Title */}
                  <Field label="Title *">
                    <input style={styles.input} name="title" value={form.title} onChange={handleChange} placeholder="e.g. Summer Sale 2025" />
                  </Field>

                  {/* Subtitle */}
                  <Field label="Subtitle">
                    <input style={styles.input} name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="e.g. Up to 80% off on all items" />
                  </Field>

                  {/* Offer Text */}
                  <Field label="Offer Text (badge)">
                    <input style={styles.input} name="offerText" value={form.offerText} onChange={handleChange} placeholder="e.g. Up to 80% OFF" />
                  </Field>

                  {/* Badge */}
                  <Field label="Badge Label">
                    <input style={styles.input} name="badgeText" value={form.badgeText} onChange={handleChange} placeholder="e.g. NEW LAUNCH / HOT DEAL" />
                  </Field>

                  {/* CTA Text */}
                  <Field label="Button Text">
                    <input style={styles.input} name="ctaText" value={form.ctaText} onChange={handleChange} placeholder="Shop Now" />
                  </Field>

                  {/* CTA Link */}
                  <Field label="Button Link">
                    <input style={styles.input} name="ctaLink" value={form.ctaLink} onChange={handleChange} placeholder="/shop or https://..." />
                  </Field>

                  {/* Position */}
                  <Field label="Position">
                    <select style={styles.input} name="position" value={form.position} onChange={handleChange}>
                      {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </Field>

                  {/* Status */}
                  <Field label="Status">
                    <select style={styles.input} name="status" value={form.status} onChange={handleChange}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>

                  {/* Priority */}
                  <Field label="Priority (higher = first)">
                    <input style={styles.input} type="number" name="priority" value={form.priority} onChange={handleChange} placeholder="0" />
                  </Field>

                  {/* Start Date */}
                  <Field label="Start Date (optional)">
                    <input style={styles.input} type="date" name="startDate" value={form.startDate} onChange={handleChange} />
                  </Field>

                  {/* End Date */}
                  <Field label="End Date (optional)">
                    <input style={styles.input} type="date" name="endDate" value={form.endDate} onChange={handleChange} />
                  </Field>
                </div>

                {/* Description — full width */}
                <Field label="Description" style={{ marginTop: 14 }}>
                  <textarea
                    style={{ ...styles.input, minHeight: 80, resize: "vertical" }}
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Short description shown on the banner..."
                  />
                </Field>

                {/* Banner Image Upload */}
                <div style={{ marginTop: 14 }}>
                  <label style={styles.label}>Banner Image</label>
                  <div style={styles.imageRow}>
                    <label style={styles.uploadBox}>
                      <span style={{ fontSize: 22 }}>🖼️</span>
                      <span style={{ fontSize: 11, color: "#6b7280" }}>
                        {uploading ? "Uploading…" : "Click to upload"}
                      </span>
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
                    </label>

                    {/* URL fallback */}
                    <input
                      style={{ ...styles.input, flex: 1 }}
                      placeholder="Or paste image URL"
                      value={form.bannerImage.startsWith("blob:") ? "" : form.bannerImage}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, bannerImage: e.target.value }));
                        setImgPreview(e.target.value);
                      }}
                    />

                    {imgPreview && (
                      <div style={styles.previewWrap}>
                        <img src={imgPreview} alt="preview" style={styles.previewImg} onError={() => setImgPreview("")} />
                        <button style={styles.removeImg} onClick={() => { setForm((f) => ({ ...f, bannerImage: "" })); setImgPreview(""); }}>✕</button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ── SEO TAB ───────────────────────────────────────────────── */}
            {activeTab === "seo" && (
              <div style={{ ...styles.formGrid, marginTop: 0 }}>
                <Field label={`Meta Title (${form.seo.metaTitle.length}/60)`}>
                  <input
                    style={{ ...styles.input, borderColor: form.seo.metaTitle.length > 60 ? "#ef4444" : "#e5e7eb" }}
                    name="metaTitle"
                    value={form.seo.metaTitle}
                    onChange={handleSeoChange}
                    placeholder="Page title for search engines"
                  />
                </Field>

                <Field label={`Meta Description (${form.seo.metaDescription.length}/160)`} style={{ gridColumn: "span 2" }}>
                  <textarea
                    style={{ ...styles.input, minHeight: 70, borderColor: form.seo.metaDescription.length > 160 ? "#ef4444" : "#e5e7eb" }}
                    name="metaDescription"
                    value={form.seo.metaDescription}
                    onChange={handleSeoChange}
                    placeholder="Brief description for search engines (max 160 chars)"
                  />
                </Field>

                <Field label="Keywords (comma separated)" style={{ gridColumn: "span 3" }}>
                  <input
                    style={styles.input}
                    name="keywords"
                    value={form.seo.keywords}
                    onChange={handleSeoChange}
                    placeholder="sale, discount, electronics, fashion"
                  />
                </Field>

                <Field label="OG Title (Social Share)">
                  <input style={styles.input} name="ogTitle" value={form.seo.ogTitle} onChange={handleSeoChange} placeholder="Title when shared on WhatsApp/Facebook" />
                </Field>

                <Field label="OG Description" style={{ gridColumn: "span 2" }}>
                  <textarea
                    style={{ ...styles.input, minHeight: 70 }}
                    name="ogDescription"
                    value={form.seo.ogDescription}
                    onChange={handleSeoChange}
                    placeholder="Description when shared on social media"
                  />
                </Field>

                <Field label="OG Image URL (leave blank = use banner)" style={{ gridColumn: "span 3" }}>
                  <input style={styles.input} name="ogImage" value={form.seo.ogImage} onChange={handleSeoChange} placeholder="https://..." />
                </Field>

                {/* SEO Preview */}
                {form.seo.metaTitle && (
                  <div style={{ gridColumn: "span 3", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
                    <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 8, fontWeight: 600 }}>GOOGLE PREVIEW</p>
                    <p style={{ color: "#1a0dab", fontSize: 17, margin: 0, fontWeight: 500 }}>{form.seo.metaTitle}</p>
                    <p style={{ color: "#006621", fontSize: 12, margin: "2px 0" }}>https://yoursite.com/shop</p>
                    <p style={{ color: "#545454", fontSize: 13, margin: 0 }}>{form.seo.metaDescription || "No description set."}</p>
                  </div>
                )}
              </div>
            )}

            {/* Form Actions */}
            <div style={styles.formActions}>
              <button style={styles.cancelBtn} onClick={resetForm}>Cancel</button>
              <button
                style={{ ...styles.saveBtn, opacity: saving || uploading ? 0.7 : 1 }}
                onClick={handleSubmit}
                disabled={saving || uploading}
              >
                {saving ? "Saving…" : editItem ? "Update" : "Publish Ad"}
              </button>
            </div>
          </div>
        )}

        {/* ── Loading ─────────────────────────────────────────────────────── */}
        {loading && (
          <div style={{ textAlign: "center", padding: 48, color: "#6b7280" }}>
            Loading advertisements…
          </div>
        )}

        {/* ── Table ───────────────────────────────────────────────────────── */}
        {!loading && (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {["Banner", "Title", "Position", "Status", "Priority", "Views", "Clicks", "Schedule", "Actions"].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((ad) => (
                  <tr key={ad._id} style={styles.tr}>
                    {/* Banner thumbnail */}
                    <td style={styles.td}>
                      {ad.bannerImage ? (
                        <img src={ad.bannerImage} alt={ad.title} style={styles.thumb} onError={(e) => { e.target.style.display = "none"; }} />
                      ) : (
                        <div style={styles.thumbPlaceholder}>🖼️</div>
                      )}
                    </td>

                    <td style={styles.td}>
                      <strong style={{ fontSize: 13 }}>{ad.title}</strong>
                      {ad.offerText && (
                        <div style={{ fontSize: 11, color: "#ef4444", fontWeight: 600, marginTop: 2 }}>{ad.offerText}</div>
                      )}
                      {ad.badgeText && (
                        <span style={{ fontSize: 10, background: "#fef3c7", color: "#92400e", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                          {ad.badgeText}
                        </span>
                      )}
                    </td>

                    <td style={styles.td}>
                      <code style={styles.sku}>{ad.position}</code>
                    </td>

                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        background: ad.status === "active" ? "#d1fae5" : ad.status === "scheduled" ? "#fef3c7" : "#f3f4f6",
                        color:      ad.status === "active" ? "#065f46" : ad.status === "scheduled" ? "#92400e" : "#6b7280",
                      }}>
                        {ad.status}
                      </span>
                    </td>

                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <strong>{ad.priority}</strong>
                    </td>

                    <td style={{ ...styles.td, textAlign: "center", color: "#6b7280" }}>
                      👁 {ad.views || 0}
                    </td>

                    <td style={{ ...styles.td, textAlign: "center", color: "#6b7280" }}>
                      🖱 {ad.clicks || 0}
                    </td>

                    <td style={{ ...styles.td, fontSize: 11, color: "#9ca3af" }}>
                      {ad.startDate ? new Date(ad.startDate).toLocaleDateString("en-IN") : "—"}
                      {ad.endDate   ? ` → ${new Date(ad.endDate).toLocaleDateString("en-IN")}` : ""}
                    </td>

                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button style={styles.editBtn}   onClick={() => handleEdit(ad)}>Edit</button>
                        <button style={styles.deleteBtn} onClick={() => handleDelete(ad)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={styles.empty}>No advertisements found. Click "+ New Advertisement" to create one.</div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

// ── Helper components ─────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color }) => (
  <div style={{ ...styles.statCard, background: color }}>
    <span style={styles.statIcon}>{icon}</span>
    <div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  </div>
);

const Field = ({ label, children, style }) => (
  <div style={{ ...styles.formGroup, ...style }}>
    <label style={styles.label}>{label}</label>
    {children}
  </div>
);

// ── Styles (same pattern as Products.jsx) ─────────────────────────────────────
const styles = {
  page:        { padding: "24px", fontFamily: "'Segoe UI', sans-serif", color: "#1a1a2e" },
  header:      { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" },
  title:       { fontSize: "26px", fontWeight: "700", margin: 0 },
  subtitle:    { color: "#6b7280", margin: "4px 0 0", fontSize: "14px" },
  addBtn:      { background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 18px", fontWeight: "600", cursor: "pointer", fontSize: "14px" },
  statsRow:    { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "20px" },
  statCard:    { borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px" },
  statIcon:    { fontSize: "26px" },
  statValue:   { fontSize: "22px", fontWeight: "700" },
  statLabel:   { fontSize: "12px", color: "#6b7280", marginTop: "2px" },
  toolbar:     { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", gap: "12px", flexWrap: "wrap" },
  filterTabs:  { display: "flex", gap: "8px", flexWrap: "wrap" },
  tab:         { padding: "7px 16px", borderRadius: "20px", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: "500", color: "#6b7280" },
  tabActive:   { background: "#4f46e5", color: "#fff", border: "1px solid #4f46e5" },
  formCard:    { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
  formHeader:  { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  formTitle:   { margin: 0, fontSize: "16px", fontWeight: "700" },
  tabSwitch:   { display: "flex", gap: 6 },
  tabBtn:      { padding: "6px 14px", borderRadius: 20, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#6b7280" },
  tabBtnActive:{ background: "#4f46e5", color: "#fff", border: "1px solid #4f46e5" },
  formGrid:    { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" },
  formGroup:   { display: "flex", flexDirection: "column", gap: "6px" },
  label:       { fontSize: "12px", fontWeight: "600", color: "#6b7280" },
  input:       { padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", fontFamily: "inherit" },
  formActions: { display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "16px" },
  cancelBtn:   { background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "8px", padding: "9px 20px", cursor: "pointer", fontWeight: "600" },
  saveBtn:     { background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", padding: "9px 20px", cursor: "pointer", fontWeight: "600" },
  imageRow:    { display: "flex", alignItems: "flex-start", gap: "12px", marginTop: "6px", flexWrap: "wrap" },
  uploadBox:   { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", border: "2px dashed #e5e7eb", borderRadius: "10px", padding: "14px 20px", cursor: "pointer", minWidth: "110px", background: "#fafafa" },
  previewWrap: { position: "relative", flexShrink: 0 },
  previewImg:  { width: "80px", height: "50px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e5e7eb" },
  removeImg:   { position: "absolute", top: "-6px", right: "-6px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "50%", width: "18px", height: "18px", fontSize: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  tableWrap:   { background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
  table:       { width: "100%", borderCollapse: "collapse" },
  th:          { textAlign: "left", padding: "12px 16px", fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" },
  tr:          { borderBottom: "1px solid #f3f4f6" },
  td:          { padding: "13px 16px", fontSize: "14px", verticalAlign: "middle" },
  sku:         { background: "#f3f4f6", padding: "3px 8px", borderRadius: "4px", fontSize: "12px" },
  statusBadge: { borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: "600" },
  actions:     { display: "flex", gap: "8px" },
  editBtn:     { background: "#ede9fe", color: "#6d28d9", border: "none", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  deleteBtn:   { background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  empty:       { textAlign: "center", padding: "48px", color: "#9ca3af", fontSize: "15px" },
  thumb:       { width: "64px", height: "40px", objectFit: "cover", borderRadius: "6px", border: "1px solid #e5e7eb" },
  thumbPlaceholder: { width: "64px", height: "40px", borderRadius: "6px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" },
};

export default Advertisements;