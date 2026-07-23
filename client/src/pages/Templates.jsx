import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAllTemplates,
  selectActiveTemplates,
  selectActiveThemeId,
  addTemplate,
  deleteTemplate,
  updateTemplate,
  incrementUsage,
  setActiveTheme,
  THEMES,
} from "../features/templateSlice";
import Layout from "../components/layout/Layout";

const CATEGORIES = ["All", "Banner", "Email", "Poster"];

const STATUS_COLORS = {
  active:   { bg: "#d1fae5", text: "#065f46" },
  draft:    { bg: "#fef3c7", text: "#92400e" },
  inactive: { bg: "#f3f4f6", text: "#6b7280" },
};

const Templates = () => {
  const dispatch         = useDispatch();
  const templates        = useSelector(selectAllTemplates);
  const activeTemplates  = useSelector(selectActiveTemplates);
  const activeThemeId    = useSelector(selectActiveThemeId);

  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [applied,  setApplied]  = useState(false);

  const emptyForm = { name: "", category: "Banner", status: "draft", thumbnail: "🏷️", themeId: "minimal" };
  const [form, setForm] = useState(emptyForm);

  const filtered = templates.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = category === "All" || t.category === category;
    return matchSearch && matchCat;
  });

  const handleSubmit = () => {
    if (!form.name) return;
    if (editItem) {
      dispatch(updateTemplate({ id: editItem.id, ...form }));
    } else {
      dispatch(addTemplate(form));
    }
    setForm(emptyForm);
    setShowForm(false);
    setEditItem(null);
  };

  const handleEdit = (t) => {
    setForm({ name: t.name, category: t.category, status: t.status, thumbnail: t.thumbnail, themeId: t.themeId || "minimal" });
    setEditItem(t);
    setShowForm(true);
  };

  const handleUse = (t) => {
    dispatch(incrementUsage(t.id));
  };

  const handleApplyTheme = (themeId) => {
    dispatch(setActiveTheme(themeId));
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  const EMOJI_OPTIONS = ["🏷️", "📧", "✅", "🎯", "🎉", "📢", "🛍️", "💌", "📣", "🖼️"];

  return (
    <Layout>
      <div style={styles.page}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Templates</h1>
            <p style={styles.subtitle}>{templates.length} total templates</p>
          </div>
          <button
            style={styles.addBtn}
            onClick={() => { setShowForm(true); setEditItem(null); setForm(emptyForm); }}
          >
            + New Template
          </button>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          <StatCard label="Total Templates" value={templates.length}                              icon="🗂️" color="#e0e7ff" />
          <StatCard label="Active"          value={activeTemplates.length}                        icon="✅" color="#d1fae5" />
          <StatCard label="Drafts"          value={templates.filter(t => t.status === "draft").length} icon="📝" color="#fef3c7" />
          <StatCard label="Total Uses"      value={templates.reduce((s, t) => s + t.usageCount, 0)} icon="🔁" color="#f3e8ff" />
        </div>

        {/* ── THEME PICKER ─────────────────────────────────────────────────── */}
        <div style={styles.themeSection}>
          <div style={styles.themeSectionHeader}>
            <div>
              <h2 style={styles.themeSectionTitle}>🎨 Shop Theme</h2>
              <p style={styles.themeSectionSub}>Choose a visual style for the customer orders page</p>
            </div>
            {applied && (
              <div style={styles.appliedBadge}>✅ Applied to Shop!</div>
            )}
          </div>
          <div style={styles.themeGrid}>
            {Object.values(THEMES).map((theme) => {
              const isActive = theme.id === activeThemeId;
              return (
                <div
                  key={theme.id}
                  style={{
                    ...styles.themeCard,
                    ...(isActive ? styles.themeCardActive : {}),
                  }}
                >
                  {/* Mini preview */}
                  <div style={{
                    ...styles.themePreview,
                    background: theme.styles.pageBg,
                    border: `1px solid ${theme.styles.cardBorder}`,
                  }}>
                    <div style={{
                      background: theme.styles.cardBg,
                      borderRadius: theme.styles.cardRadius,
                      padding: "6px 8px",
                      border: `1px solid ${theme.styles.cardBorder}`,
                      boxShadow: theme.styles.shadow,
                    }}>
                      <div style={{ width: "40%", height: "5px", borderRadius: "3px", background: theme.styles.accent, marginBottom: "5px" }} />
                      <div style={{ width: "70%", height: "4px", borderRadius: "3px", background: theme.styles.secondaryText, opacity: 0.3, marginBottom: "3px" }} />
                      <div style={{ width: "55%", height: "4px", borderRadius: "3px", background: theme.styles.secondaryText, opacity: 0.2 }} />
                    </div>
                  </div>

                  <div style={styles.themeInfo}>
                    <span style={styles.themeEmoji}>{theme.thumbnail}</span>
                    <div>
                      <div style={styles.themeName}>{theme.name}</div>
                      <div style={styles.themeDesc}>{theme.description}</div>
                    </div>
                  </div>

                  {isActive ? (
                    <div style={styles.activeThemeLabel}>✓ Active</div>
                  ) : (
                    <button
                      style={styles.applyBtn}
                      onClick={() => handleApplyTheme(theme.id)}
                    >
                      Apply to Shop
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* ──────────────────────────────────────────────────────────────────── */}

        {/* Toolbar */}
        <div style={styles.toolbar}>
          <div style={styles.filterTabs}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                style={{ ...styles.tab, ...(category === c ? styles.tabActive : {}) }}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <input
            style={styles.search}
            placeholder="Search templates…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>{editItem ? "Edit Template" : "New Template"}</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Template Name</label>
                <input
                  style={styles.input}
                  placeholder="e.g. Summer Sale Banner"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select style={styles.input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {["Banner", "Email", "Poster"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Status</label>
                <select style={styles.input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {["active", "draft", "inactive"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Theme</label>
                <select style={styles.input} value={form.themeId || "minimal"} onChange={(e) => setForm({ ...form, themeId: e.target.value })}>
                  {Object.values(THEMES).map((t) => <option key={t.id} value={t.id}>{t.thumbnail} {t.name}</option>)}
                </select>
              </div>
              <div style={{ ...styles.formGroup, gridColumn: "1 / -1" }}>
                <label style={styles.label}>Icon</label>
                <div style={styles.emojiRow}>
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      style={{ ...styles.emojiBtn, ...(form.thumbnail === e ? styles.emojiBtnActive : {}) }}
                      onClick={() => setForm({ ...form, thumbnail: e })}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={styles.formActions}>
              <button style={styles.cancelBtn} onClick={() => { setShowForm(false); setEditItem(null); }}>Cancel</button>
              <button style={styles.saveBtn} onClick={handleSubmit}>{editItem ? "Update" : "Create Template"}</button>
            </div>
          </div>
        )}

        {/* Cards Grid */}
        <div style={styles.grid}>
          {filtered.map((t) => {
            const sc        = STATUS_COLORS[t.status] || {};
            const cardTheme = THEMES[t.themeId] || THEMES.minimal;
            return (
              <div key={t.id} style={styles.card}>
                <div style={styles.cardTop}>
                  <div style={styles.thumbWrap}>{t.thumbnail}</div>
                  <span style={{ ...styles.statusBadge, background: sc.bg, color: sc.text }}>
                    {t.status}
                  </span>
                </div>
                <h3 style={styles.cardTitle}>{t.name}</h3>
                <div style={styles.cardMeta}>
                  <span style={styles.catTag}>{t.category}</span>
                  <span style={styles.usageTag}>🔁 {t.usageCount} uses</span>
                </div>
                {/* Theme indicator */}
                <div style={styles.cardThemeRow}>
                  <span style={{ ...styles.themeIndicator, background: cardTheme.styles.accent }}>
                    {cardTheme.thumbnail} {cardTheme.name}
                  </span>
                </div>
                <div style={styles.cardDate}>Created {t.createdAt}</div>
                <div style={styles.cardActions}>
                  <button style={styles.useBtn}    onClick={() => handleUse(t)}>Use</button>
                  <button style={styles.editBtn}   onClick={() => handleEdit(t)}>Edit</button>
                  <button style={styles.deleteBtn} onClick={() => dispatch(deleteTemplate(t.id))}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && <div style={styles.empty}>No templates found.</div>}
      </div>
    </Layout>
  );
};

const StatCard = ({ label, value, icon, color }) => (
  <div style={{ ...styles.statCard, background: color }}>
    <span style={styles.statIcon}>{icon}</span>
    <div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  </div>
);

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

  // Theme Picker Section
  themeSection:       { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "20px", marginBottom: "20px" },
  themeSectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" },
  themeSectionTitle:  { fontSize: "16px", fontWeight: "700", margin: "0 0 4px" },
  themeSectionSub:    { fontSize: "13px", color: "#6b7280", margin: 0 },
  appliedBadge:       { background: "#d1fae5", color: "#065f46", borderRadius: "20px", padding: "6px 14px", fontSize: "13px", fontWeight: "600" },
  themeGrid:          { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" },
  themeCard:          { border: "2px solid #e5e7eb", borderRadius: "12px", padding: "12px", cursor: "pointer", transition: "border-color 0.2s" },
  themeCardActive:    { border: "2px solid #4f46e5", background: "#eef2ff" },
  themePreview:       { height: "52px", borderRadius: "8px", padding: "8px", marginBottom: "10px", display: "flex", alignItems: "center" },
  themeInfo:          { display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" },
  themeEmoji:         { fontSize: "18px" },
  themeName:          { fontSize: "13px", fontWeight: "700", color: "#1a1a2e" },
  themeDesc:          { fontSize: "11px", color: "#6b7280" },
  activeThemeLabel:   { width: "100%", textAlign: "center", fontSize: "12px", fontWeight: "700", color: "#4f46e5", padding: "6px", background: "#eef2ff", borderRadius: "6px" },
  applyBtn:           { width: "100%", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "6px", padding: "7px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },

  toolbar:      { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", gap: "12px", flexWrap: "wrap" },
  filterTabs:   { display: "flex", gap: "8px" },
  tab:          { padding: "7px 16px", borderRadius: "20px", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: "500", color: "#6b7280" },
  tabActive:    { background: "#4f46e5", color: "#fff", border: "1px solid #4f46e5" },
  search:       { padding: "9px 14px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", minWidth: "220px" },
  formCard:     { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
  formTitle:    { margin: "0 0 16px", fontSize: "16px", fontWeight: "700" },
  formGrid:     { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" },
  formGroup:    { display: "flex", flexDirection: "column", gap: "6px" },
  label:        { fontSize: "12px", fontWeight: "600", color: "#6b7280" },
  input:        { padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none" },
  emojiRow:     { display: "flex", gap: "8px", flexWrap: "wrap" },
  emojiBtn:     { fontSize: "22px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "6px 10px", cursor: "pointer" },
  emojiBtnActive: { background: "#ede9fe", border: "1px solid #6d28d9" },
  formActions:  { display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "16px" },
  cancelBtn:    { background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "8px", padding: "9px 20px", cursor: "pointer", fontWeight: "600" },
  saveBtn:      { background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", padding: "9px 20px", cursor: "pointer", fontWeight: "600" },
  grid:         { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" },
  card:         { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "18px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "10px" },
  cardTop:      { display: "flex", justifyContent: "space-between", alignItems: "center" },
  thumbWrap:    { fontSize: "32px", background: "#f9fafb", borderRadius: "10px", width: "52px", height: "52px", display: "flex", alignItems: "center", justifyContent: "center" },
  statusBadge:  { borderRadius: "20px", padding: "4px 12px", fontSize: "11px", fontWeight: "600" },
  cardTitle:    { fontSize: "15px", fontWeight: "700", margin: 0, color: "#1a1a2e" },
  cardMeta:     { display: "flex", gap: "8px", alignItems: "center" },
  catTag:       { background: "#e0e7ff", color: "#3730a3", borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: "500" },
  usageTag:     { fontSize: "12px", color: "#6b7280" },
  cardThemeRow: { display: "flex" },
  themeIndicator: { borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: "600", color: "#fff" },
  cardDate:     { fontSize: "12px", color: "#9ca3af" },
  cardActions:  { display: "flex", gap: "8px", marginTop: "4px" },
  useBtn:       { flex: 1, background: "#4f46e5", color: "#fff", border: "none", borderRadius: "6px", padding: "7px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  editBtn:      { background: "#ede9fe", color: "#6d28d9", border: "none", borderRadius: "6px", padding: "7px 12px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  deleteBtn:    { background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "6px", padding: "7px 12px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  empty:        { textAlign: "center", padding: "60px", color: "#9ca3af", fontSize: "15px" },
};

export default Templates;