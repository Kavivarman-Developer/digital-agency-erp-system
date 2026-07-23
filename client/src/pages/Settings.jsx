// pages/Settings.jsx — CRM Admin Premium Features Control
import React, { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";

// ─────────────────────────────────────────────────────────────────────────────
// Feature definitions
// ─────────────────────────────────────────────────────────────────────────────
const FEATURE_GROUPS = [
  {
    group: "🛒 Customer Shop",
    features: [
      { key: "shop_wishlist", label: "Wishlist / Favorites", desc: "Customers can save favourite products to a dedicated Favorites page", tier: "free" },
      { key: "shop_search", label: "Product Search", desc: "Search bar on customer shop page", tier: "free" },
      { key: "shop_sort", label: "Sort & Filter", desc: "Sort by price, name etc.", tier: "free" },
      { key: "shop_offerBadge", label: "Offer Badges", desc: "Show offer labels on product cards", tier: "free" },
      { key: "shop_midBanner", label: "Mid-Page Banners", desc: "Ads between products grid", tier: "premium" },
      { key: "shop_heroBanner", label: "Hero Banner Carousel", desc: "Auto-sliding hero banners from CRM", tier: "premium" },
      { key: "shop_seo", label: "SEO Meta Tags", desc: "Dynamic meta tags from CRM ads", tier: "premium" },
    ],
  },
  {
    group: "📢 Advertisements",
    features: [
      { key: "ads_basic", label: "Basic Ads", desc: "Create and publish simple banners", tier: "free" },
      { key: "ads_schedule", label: "Ad Scheduling", desc: "Set start/end dates for ads", tier: "premium" },
      { key: "ads_analytics", label: "Views & Clicks Analytics", desc: "Track ad performance", tier: "premium" },
      { key: "ads_seoFields", label: "SEO Fields in Ads", desc: "Meta title, description, OG tags", tier: "premium" },
    ],
  },
  {
    group: "📦 Products",
    features: [
      { key: "prod_offerLabel", label: "Offer Label Badge", desc: "Custom badge on product cards", tier: "free" },
      { key: "prod_bulkUpload", label: "Bulk Product Upload", desc: "CSV import for products", tier: "premium" },
      { key: "prod_lowStockAlert", label: "Low Stock Alerts", desc: "Notification when stock < 5", tier: "premium" },
      { key: "prod_unlimitedProducts", label: "Unlimited Products", desc: "Add more than 30 products (Free plan limit: 30)", tier: "premium" },
    ],
  },
  {
    group: "📊 CRM & Reports",
    features: [
      { key: "crm_loginHistory", label: "Login History", desc: "Track staff login activity", tier: "free" },
      { key: "crm_orderReports", label: "Order Reports", desc: "Export order data as CSV/PDF", tier: "premium" },
      { key: "crm_customerReports", label: "Customer Reports", desc: "Customer spend & activity reports", tier: "premium" },
      { key: "crm_revenueChart", label: "Revenue Dashboard", desc: "Visual revenue charts & trends", tier: "premium" },
    ],
  },
];

export const SETTINGS_KEY = "qs_feature_settings";
export const PRODUCT_LIMIT_FREE = 30;

export const defaultSettings = () => {
  const defaults = {};
  FEATURE_GROUPS.forEach((g) =>
    g.features.forEach((f) => { defaults[f.key] = f.tier === "free"; })
  );
  return defaults;
};

export const loadSettings = () => {
  try { return { ...defaultSettings(), ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) }; }
  catch { return defaultSettings(); }
};

// Helper hook — any component can use this
export const useFeature = (key) => {
  const settings = loadSettings();
  return !!settings[key];
};

// ─────────────────────────────────────────────────────────────────────────────
const Settings = () => {
  const [settings, setSettings] = useState(loadSettings);
  const [saved, setSaved] = useState(false);
  const [plan, setPlan] = useState(() => localStorage.getItem("qs_plan") || "free");

  const allFeatures = FEATURE_GROUPS.flatMap(g => g.features);
  const enabledCount = Object.values(settings).filter(Boolean).length;

  const toggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const enableAll = () => {
    const all = {};
    allFeatures.forEach((f) => { all[f.key] = true; });
    setSettings(all); setSaved(false);
  };

  const resetToFree = () => { setSettings(defaultSettings()); setSaved(false); };

  const handleSave = () => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      localStorage.setItem("qs_plan", plan);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { }
  };

  // ── If plan changes → auto-enable/disable premium features ────────────────
  const handlePlanChange = (newPlan) => {
    setPlan(newPlan);
    if (newPlan === "free") {
      // Disable all premium features when switching to free
      const updated = { ...settings };
      allFeatures.filter(f => f.tier === "premium").forEach(f => { updated[f.key] = false; });
      setSettings(updated);
    } else {
      // Enable all features when switching to premium
      const updated = { ...settings };
      allFeatures.forEach(f => { updated[f.key] = true; });
      setSettings(updated);
    }
    setSaved(false);
  };

  return (
    <Layout>
      <div style={s.page}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>⚙️ Feature Settings</h1>
            <p style={s.subtitle}>Enable or disable features for your QuickShop CRM</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button style={s.outlineBtn} onClick={resetToFree}>Reset to Free</button>
            <button style={s.premiumBtn} onClick={enableAll}>✨ Enable All</button>
            <button style={{ ...s.saveBtn, background: saved ? "#059669" : "#4f46e5" }} onClick={handleSave}>
              {saved ? "✓ Saved!" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Product Limit Banner */}
        <div style={{
          ...s.limitBanner,
          background: settings.prod_unlimitedProducts ? "#f0fdf4" : "#fffbeb",
          borderColor: settings.prod_unlimitedProducts ? "#bbf7d0" : "#fde68a",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>{settings.prod_unlimitedProducts ? "✅" : "⚠️"}</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: settings.prod_unlimitedProducts ? "#065f46" : "#92400e" }}>
                {settings.prod_unlimitedProducts
                  ? "Unlimited Products — Active"
                  : `Product Limit: ${PRODUCT_LIMIT_FREE} products (Free Plan)`}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>
                {settings.prod_unlimitedProducts
                  ? "You can add unlimited products."
                  : `Enable "Unlimited Products" under 📦 Products section to remove the ${PRODUCT_LIMIT_FREE}-product cap.`}
              </p>
            </div>
          </div>
        </div>

        {/* Favorites Banner */}
        <div style={{
          ...s.limitBanner,
          background: settings.shop_wishlist ? "#f0f9ff" : "#fafafa",
          borderColor: settings.shop_wishlist ? "#bae6fd" : "#e5e7eb",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>{settings.shop_wishlist ? "❤️" : "🤍"}</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: settings.shop_wishlist ? "#0369a1" : "#6b7280" }}>
                {settings.shop_wishlist ? "Favorites / Wishlist — Active" : "Favorites / Wishlist — Disabled"}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>
                {settings.shop_wishlist
                  ? 'Customers can save products. "/shop/favorites" page is accessible.'
                  : 'Enable "Wishlist / Favorites" under 🛒 Customer Shop to activate the Favorites page.'}
              </p>
            </div>
          </div>
        </div>

        {/* Plan Selector */}
        <div style={s.planCard}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>Current Plan</p>
              <p style={{ color: "#6b7280", fontSize: 13, margin: "4px 0 0" }}>
                {enabledCount} of {allFeatures.length} features enabled
                {plan === "premium" && <span style={{ color: "#7c3aed", fontWeight: 600 }}> · Premium Active ✨</span>}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["free", "premium"].map((p) => (
                <button key={p}
                  style={{
                    ...s.planBtn,
                    background: plan === p ? (p === "premium" ? "#7c3aed" : "#4f46e5") : "#f3f4f6",
                    color: plan === p ? "#fff" : "#6b7280",
                    border: plan === p ? "none" : "1px solid #e5e7eb",
                  }}
                  onClick={() => handlePlanChange(p)}>
                  {p === "premium" ? "✨ Premium" : "Free Plan"}
                </button>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6b7280", marginBottom: 4 }}>
              <span>{enabledCount} features ON</span>
              <span>{allFeatures.length} total</span>
            </div>
            <div style={{ height: 6, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 99,
                width: `${(enabledCount / allFeatures.length) * 100}%`,
                background: plan === "premium" ? "#7c3aed" : "#4f46e5",
                transition: "width 0.3s",
              }} />
            </div>
          </div>
        </div>

        {/* Feature Groups */}
        {FEATURE_GROUPS.map((group) => (
          <div key={group.group} style={s.groupCard}>
            <h3 style={s.groupTitle}>{group.group}</h3>
            <div style={s.featureList}>
              {group.features.map((feature) => {
                const isOn = settings[feature.key];
                const isPremium = feature.tier === "premium";
                return (
                  <div key={feature.key} style={{
                    ...s.featureRow,
                    background: isOn ? (isPremium ? "#faf5ff" : "#f0fdf4") : "#fff",
                    borderColor: isOn ? (isPremium ? "#e9d5ff" : "#bbf7d0") : "#f3f4f6",
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{feature.label}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20,
                          background: isPremium ? "#ede9fe" : "#d1fae5",
                          color: isPremium ? "#7c3aed" : "#065f46",
                        }}>
                          {isPremium ? "PREMIUM" : "FREE"}
                        </span>
                        {/* Special badge for key features */}
                        {feature.key === "shop_wishlist" && (
                          <span style={{ fontSize: 10, background: "#fce7f3", color: "#be185d", padding: "1px 7px", borderRadius: 20, fontWeight: 700 }}>
                            ❤️ FAVORITES PAGE
                          </span>
                        )}
                        {feature.key === "prod_unlimitedProducts" && (
                          <span style={{ fontSize: 10, background: "#fef3c7", color: "#92400e", padding: "1px 7px", borderRadius: 20, fontWeight: 700 }}>
                            📦 LIMIT CONTROL
                          </span>
                        )}
                      </div>
                      <p style={{ color: "#6b7280", fontSize: 12, margin: "3px 0 0" }}>{feature.desc}</p>
                    </div>

                    {/* Toggle */}
                    <button
                      onClick={() => toggle(feature.key)}
                      style={{
                        width: 44, height: 24, borderRadius: 99, border: "none", cursor: "pointer",
                        background: isOn ? (isPremium ? "#7c3aed" : "#059669") : "#d1d5db",
                        transition: "background 0.2s", position: "relative", flexShrink: 0,
                      }}
                    >
                      <span style={{
                        position: "absolute", top: 3, left: isOn ? 22 : 3,
                        width: 18, height: 18, borderRadius: "50%", background: "#fff",
                        transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      }} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Save bar */}
        <div style={s.saveBar}>
          <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>
            Changes saved to localStorage — visible immediately across CRM & Customer Shop
          </p>
          <button style={{ ...s.saveBtn, background: saved ? "#059669" : "#4f46e5" }} onClick={handleSave}>
            {saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </Layout>
  );
};

const s = {
  page: { padding: "24px", fontFamily: "'Segoe UI', sans-serif", color: "#1a1a2e", maxWidth: 900 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: 12 },
  title: { fontSize: "24px", fontWeight: "700", margin: 0 },
  subtitle: { color: "#6b7280", margin: "4px 0 0", fontSize: "14px" },
  outlineBtn: { background: "#fff", color: "#6b7280", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "9px 16px", fontWeight: "600", cursor: "pointer", fontSize: "13px" },
  premiumBtn: { background: "#ede9fe", color: "#7c3aed", border: "none", borderRadius: "8px", padding: "9px 16px", fontWeight: "700", cursor: "pointer", fontSize: "13px" },
  saveBtn: { color: "#fff", border: "none", borderRadius: "8px", padding: "9px 20px", fontWeight: "600", cursor: "pointer", fontSize: "13px", transition: "background 0.3s" },
  planCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
  planBtn: { borderRadius: "8px", padding: "8px 18px", fontWeight: "700", cursor: "pointer", fontSize: "13px", transition: "all 0.2s" },
  groupCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
  groupTitle: { margin: "0 0 14px", fontSize: "15px", fontWeight: "700" },
  featureList: { display: "flex", flexDirection: "column", gap: 10 },
  featureRow: { display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", borderRadius: "10px", border: "1px solid", transition: "all 0.2s" },
  saveBar: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px 20px", marginTop: 8 },
  limitBanner: { border: "1px solid", borderRadius: "12px", padding: "14px 18px", marginBottom: "16px" },
};

export default Settings;