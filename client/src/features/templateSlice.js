import { createSlice } from "@reduxjs/toolkit";

// ─── 4 Built-in Themes ────────────────────────────────────────────────────────
export const THEMES = {
  minimal: {
    id: "minimal",
    name: "Minimal",
    thumbnail: "🤍",
    description: "Clean & light",
    styles: {
      pageBg: "#f9fafb",
      cardBg: "#ffffff",
      cardBorder: "#f0f0f0",
      primaryText: "#1e293b",
      secondaryText: "#6b7280",
      accent: "#4f46e5",
      accentText: "#ffffff",
      badgePending: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
      badgeAccepted: { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" },
      badgeShipped: { bg: "#ede9fe", text: "#5b21b6", border: "#ddd6fe" },
      badgeDelivered: { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" },
      totalColor: "#1e293b",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      headerStyle: "clean",
      cardRadius: "12px",
      shadow: "0 1px 3px rgba(0,0,0,0.06)",
    },
  },
  dark: {
    id: "dark",
    name: "Dark Mode",
    thumbnail: "🌙",
    description: "Easy on the eyes",
    styles: {
      pageBg: "#0f172a",
      cardBg: "#1e293b",
      cardBorder: "#334155",
      primaryText: "#f1f5f9",
      secondaryText: "#94a3b8",
      accent: "#818cf8",
      accentText: "#0f172a",
      badgePending: { bg: "#422006", text: "#fde68a", border: "#713f12" },
      badgeAccepted: { bg: "#0c1a3a", text: "#93c5fd", border: "#1d4ed8" },
      badgeShipped: { bg: "#2e1065", text: "#c4b5fd", border: "#7c3aed" },
      badgeDelivered: { bg: "#022c22", text: "#6ee7b7", border: "#065f46" },
      totalColor: "#a5b4fc",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      headerStyle: "dark",
      cardRadius: "12px",
      shadow: "0 4px 12px rgba(0,0,0,0.4)",
    },
  },
  festive: {
    id: "festive",
    name: "Festive",
    thumbnail: "🎉",
    description: "Colorful & fun",
    styles: {
      pageBg: "#fff7ed",
      cardBg: "#ffffff",
      cardBorder: "#fed7aa",
      primaryText: "#7c2d12",
      secondaryText: "#c2410c",
      accent: "#ea580c",
      accentText: "#ffffff",
      badgePending: { bg: "#fef9c3", text: "#713f12", border: "#fde68a" },
      badgeAccepted: { bg: "#cffafe", text: "#155e75", border: "#67e8f9" },
      badgeShipped: { bg: "#fce7f3", text: "#831843", border: "#f9a8d4" },
      badgeDelivered: { bg: "#dcfce7", text: "#14532d", border: "#86efac" },
      totalColor: "#ea580c",
      fontFamily: "'Georgia', serif",
      headerStyle: "festive",
      cardRadius: "16px",
      shadow: "0 2px 8px rgba(234,88,12,0.15)",
    },
  },
  corporate: {
    id: "corporate",
    name: "Corporate",
    thumbnail: "💼",
    description: "Professional & bold",
    styles: {
      pageBg: "#f8fafc",
      cardBg: "#ffffff",
      cardBorder: "#e2e8f0",
      primaryText: "#0f172a",
      secondaryText: "#475569",
      accent: "#0f172a",
      accentText: "#ffffff",
      badgePending: { bg: "#fff8e1", text: "#5d4037", border: "#ffe082" },
      badgeAccepted: { bg: "#e3f2fd", text: "#0d47a1", border: "#90caf9" },
      badgeShipped: { bg: "#f3e5f5", text: "#4a148c", border: "#ce93d8" },
      badgeDelivered: { bg: "#e8f5e9", text: "#1b5e20", border: "#a5d6a7" },
      totalColor: "#0f172a",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      headerStyle: "corporate",
      cardRadius: "4px",
      shadow: "0 1px 2px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(0,0,0,0.05)",
    },
  },
};

const initialState = {
  items: [
    {
      id: 1,
      name: "Summer Sale Banner",
      category: "Banner",
      status: "active",
      createdAt: "10 Jun 2025",
      usageCount: 12,
      thumbnail: "🏷️",
      themeId: "minimal",
    },
    {
      id: 2,
      name: "Welcome Email",
      category: "Email",
      status: "active",
      createdAt: "15 Jun 2025",
      usageCount: 8,
      thumbnail: "📧",
      themeId: "minimal",
    },
    {
      id: 3,
      name: "Order Confirmation",
      category: "Email",
      status: "active",
      createdAt: "20 Jun 2025",
      usageCount: 34,
      thumbnail: "✅",
      themeId: "minimal",
    },
    {
      id: 4,
      name: "Product Launch Poster",
      category: "Poster",
      status: "draft",
      createdAt: "01 Jul 2025",
      usageCount: 0,
      thumbnail: "🎯",
      themeId: "festive",
    },
    {
      id: 5,
      name: "Festive Offer Card",
      category: "Banner",
      status: "inactive",
      createdAt: "05 Aug 2025",
      usageCount: 5,
      thumbnail: "🎉",
      themeId: "festive",
    },
  ],
  loading: false,
  error: null,
  // Active theme applied to the customer shop
  activeThemeId: localStorage.getItem("shopTheme") || "minimal",
};

const templateSlice = createSlice({
  name: "templates",
  initialState,
  reducers: {
    addTemplate(state, action) {
      state.items.unshift({
        ...action.payload,
        id: Date.now(),
        usageCount: 0,
        themeId: action.payload.themeId || "minimal",
        createdAt: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      });
    },

    updateTemplate(state, action) {
      const { id, ...changes } = action.payload;
      const template = state.items.find((t) => t.id === id);
      if (template) Object.assign(template, changes);
    },

    deleteTemplate(state, action) {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },

    incrementUsage(state, action) {
      const template = state.items.find((t) => t.id === action.payload);
      if (template) template.usageCount += 1;
    },

    // ── NEW: Set the active shop theme ──────────────────────────────────────
    setActiveTheme(state, action) {
      state.activeThemeId = action.payload;
      localStorage.setItem("shopTheme", action.payload);
    },
  },
});

export const {
  addTemplate,
  updateTemplate,
  deleteTemplate,
  incrementUsage,
  setActiveTheme,
} = templateSlice.actions;

// Selectors
export const selectAllTemplates    = (state) => state.templates.items;
export const selectActiveTemplates = (state) =>
  state.templates.items.filter((t) => t.status === "active");
export const selectTemplatesByCategory = (category) => (state) =>
  state.templates.items.filter((t) => t.category === category);

// ── NEW selectors ────────────────────────────────────────────────────────────
export const selectActiveThemeId = (state) => state.templates.activeThemeId;
export const selectActiveTheme   = (state) =>
  THEMES[state.templates.activeThemeId] ?? THEMES.minimal;

export default templateSlice.reducer;