import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { selectActiveTheme } from "../../features/templateSlice";

// Fallback theme if Redux store doesn't have templateSlice yet
const DEFAULT_THEME = {
  styles: {
    pageBg: "#f9fafb",
    cardBg: "#ffffff",
    cardBorder: "#f0f0f0",
    primaryText: "#1e293b",
    secondaryText: "#6b7280",
    accent: "#4f46e5",
    accentText: "#ffffff",
    badgePending:   { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
    badgeAccepted:  { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" },
    badgeShipped:   { bg: "#ede9fe", text: "#5b21b6", border: "#ddd6fe" },
    badgeDelivered: { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" },
    totalColor: "#1e293b",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    cardRadius: "12px",
    shadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
};

// Safe selector — works even if templateSlice isn't in the store yet
const useSafeTheme = () => {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const theme = useSelector(selectActiveTheme);
    return theme ?? DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
};

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_META = {
  pending:   { label: "Pending",   icon: "🕐", step: 1 },
  accepted:  { label: "Accepted",  icon: "✅", step: 2 },
  shipped:   { label: "Shipped",   icon: "🚚", step: 3 },
  delivered: { label: "Delivered", icon: "📦", step: 4 },
};

const STEPS = ["Pending", "Accepted", "Shipped", "Delivered"];

// ── Progress Tracker ──────────────────────────────────────────────────────────
const OrderProgress = ({ status, theme }) => {
  const currentStep = STATUS_META[status]?.step ?? 1;
  const s = theme.styles;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, margin: "12px 0 4px" }}>
      {STEPS.map((step, i) => {
        const stepNum   = i + 1;
        const done      = stepNum < currentStep;
        const active    = stepNum === currentStep;
        const isLast    = i === STEPS.length - 1;

        return (
          <React.Fragment key={step}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: done || active ? s.accent : "#e5e7eb",
                color: done || active ? s.accentText : "#9ca3af",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: "700",
                boxShadow: active ? `0 0 0 3px ${s.accent}30` : "none",
                transition: "all 0.3s",
              }}>
                {done ? "✓" : stepNum}
              </div>
              <span style={{
                fontSize: "10px", fontWeight: active ? "700" : "500",
                color: active ? s.accent : done ? s.secondaryText : "#9ca3af",
                whiteSpace: "nowrap",
              }}>
                {step}
              </span>
            </div>
            {!isLast && (
              <div style={{
                flex: 1, height: "2px", marginBottom: "14px",
                background: done ? s.accent : "#e5e7eb",
                transition: "background 0.3s",
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const CustomerOrders = () => {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [expanded, setExpanded] = useState(null);

  const theme = useSafeTheme();
  const s     = theme.styles;

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const name = localStorage.getItem("customerName") || "";
        if (!name) {
          setError("Please place an order first so we can find your orders.");
          setLoading(false);
          return;
        }
        const res = await axios.get(
          `http://localhost:5000/api/orders/my?name=${encodeURIComponent(name)}`
        );
        setOrders(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, []);

  const getBadgeStyle = (status) => {
    const map = {
      pending:   s.badgePending,
      accepted:  s.badgeAccepted,
      shipped:   s.badgeShipped,
      delivered: s.badgeDelivered,
    };
    return map[status] || { bg: "#f3f4f6", text: "#6b7280", border: "#e5e7eb" };
  };

  const customerName = localStorage.getItem("customerName") || "Customer";

  // ── Page wrapper style ──
  const pageStyle = {
    minHeight: "100vh",
    background: s.pageBg,
    padding: "24px 16px",
    fontFamily: s.fontFamily,
    color: s.primaryText,
    transition: "background 0.4s, color 0.4s",
  };

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{
          background: s.cardBg,
          borderRadius: s.cardRadius,
          border: `1px solid ${s.cardBorder}`,
          boxShadow: s.shadow,
          padding: "20px 24px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div>
            <p style={{ fontSize: "12px", color: s.secondaryText, marginBottom: "4px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Welcome back
            </p>
            <h1 style={{ fontSize: "22px", fontWeight: "700", margin: 0, color: s.primaryText }}>
              {customerName}'s Orders
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {!loading && !error && (
              <div style={{
                background: s.accent + "15",
                color: s.accent,
                borderRadius: "20px",
                padding: "6px 14px",
                fontSize: "13px",
                fontWeight: "600",
              }}>
                {orders.length} order{orders.length !== 1 ? "s" : ""}
              </div>
            )}
            <Link
              to="/shop"
              style={{
                background: s.accent,
                color: s.accentText,
                borderRadius: "10px",
                padding: "8px 18px",
                fontSize: "13px",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              + Shop More
            </Link>
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{
            background: s.cardBg, borderRadius: s.cardRadius,
            border: `1px solid ${s.cardBorder}`, boxShadow: s.shadow,
            padding: "60px", textAlign: "center",
          }}>
            <div style={{
              width: "36px", height: "36px",
              border: `3px solid ${s.accent}`,
              borderTopColor: "transparent",
              borderRadius: "50%",
              margin: "0 auto 12px",
              animation: "spin 0.8s linear infinite",
            }} />
            <p style={{ color: s.secondaryText, fontSize: "14px" }}>Fetching your orders...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div style={{
            background: "#fef2f2", borderRadius: s.cardRadius,
            border: "1px solid #fecaca", padding: "24px", textAlign: "center",
          }}>
            <p style={{ color: "#dc2626", fontWeight: "600", fontSize: "15px" }}>⚠️ {error}</p>
            <Link to="/shop" style={{ color: s.accent, fontSize: "13px", marginTop: "8px", display: "inline-block" }}>
              Go to Shop →
            </Link>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && orders.length === 0 && (
          <div style={{
            background: s.cardBg, borderRadius: s.cardRadius,
            border: `1px solid ${s.cardBorder}`, boxShadow: s.shadow,
            padding: "64px 24px", textAlign: "center",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🛍️</div>
            <p style={{ color: s.primaryText, fontWeight: "600", fontSize: "17px", marginBottom: "8px" }}>
              No orders yet!
            </p>
            <p style={{ color: s.secondaryText, fontSize: "14px", marginBottom: "20px" }}>
              Browse our products and place your first order.
            </p>
            <Link
              to="/shop"
              style={{
                background: s.accent, color: s.accentText,
                borderRadius: "10px", padding: "10px 28px",
                fontSize: "14px", fontWeight: "600", textDecoration: "none",
              }}
            >
              Start Shopping
            </Link>
          </div>
        )}

        {/* ── Orders list ── */}
        {!loading && !error && orders.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {orders.map((order) => {
              const badge    = getBadgeStyle(order.status);
              const meta     = STATUS_META[order.status] || STATUS_META.pending;
              const isOpen   = expanded === order._id;
              const dateStr  = new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              });

              return (
                <div
                  key={order._id}
                  style={{
                    background: s.cardBg,
                    borderRadius: s.cardRadius,
                    border: `1px solid ${s.cardBorder}`,
                    boxShadow: s.shadow,
                    overflow: "hidden",
                    transition: "box-shadow 0.2s",
                  }}
                >
                  {/* ── Card top bar (accent stripe) ── */}
                  <div style={{ height: "3px", background: s.accent }} />

                  {/* ── Card main row ── */}
                  <div style={{ padding: "18px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>

                      {/* Left */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
                          <span style={{
                            fontFamily: "monospace", fontSize: "13px", fontWeight: "700",
                            color: s.primaryText, letterSpacing: "0.03em",
                          }}>
                            #{order._id.slice(-8).toUpperCase()}
                          </span>
                          <span style={{
                            background: badge.bg, color: badge.text,
                            border: `1px solid ${badge.border}`,
                            borderRadius: "20px", padding: "3px 10px",
                            fontSize: "11px", fontWeight: "700", letterSpacing: "0.04em",
                          }}>
                            {meta.icon} {order.status.toUpperCase()}
                          </span>
                          <span style={{
                            fontSize: "11px", color: s.secondaryText,
                          }}>
                            {dateStr}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <OrderProgress status={order.status} theme={theme} />

                        {/* Meta info */}
                        <div style={{ display: "flex", gap: "16px", marginTop: "10px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "12px", color: s.secondaryText }}>
                            💳 {order.payment}{" "}
                            <span style={{
                              fontWeight: "700",
                              color: order.paymentStatus === "paid" ? "#16a34a" : "#d97706",
                            }}>
                              ({order.paymentStatus})
                            </span>
                          </span>
                          {order.address && (
                            <span style={{ fontSize: "12px", color: s.secondaryText, maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              📍 {order.address}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right — total + expand */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
                        <div style={{ fontSize: "22px", fontWeight: "800", color: s.totalColor }}>
                          ₹{order.total}
                        </div>
                        {order.items?.length > 0 && (
                          <span style={{ fontSize: "11px", color: s.secondaryText }}>
                            {order.items.length} item{order.items.length > 1 ? "s" : ""}
                          </span>
                        )}
                        <button
                          onClick={() => setExpanded(isOpen ? null : order._id)}
                          style={{
                            background: "transparent",
                            border: `1px solid ${s.cardBorder}`,
                            borderRadius: "8px",
                            padding: "5px 12px",
                            fontSize: "12px",
                            color: s.secondaryText,
                            cursor: "pointer",
                            fontWeight: "600",
                          }}
                        >
                          {isOpen ? "Hide ▲" : "Details ▼"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── Expanded items ── */}
                  {isOpen && order.items?.length > 0 && (
                    <div style={{
                      borderTop: `1px dashed ${s.cardBorder}`,
                      padding: "14px 20px 18px",
                      background: s.pageBg,
                    }}>
                      <p style={{ fontSize: "11px", fontWeight: "700", color: s.secondaryText, marginBottom: "10px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        Order Items
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: "flex", alignItems: "center", gap: "12px",
                              background: s.cardBg,
                              borderRadius: "10px",
                              border: `1px solid ${s.cardBorder}`,
                              padding: "10px 14px",
                            }}
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover", background: "#f3f4f6" }}
                              />
                            ) : (
                              <div style={{
                                width: "40px", height: "40px", borderRadius: "8px",
                                background: s.accent + "15",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "18px",
                              }}>
                                📦
                              </div>
                            )}
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: "13px", fontWeight: "600", color: s.primaryText, margin: 0 }}>{item.name}</p>
                              <p style={{ fontSize: "12px", color: s.secondaryText, margin: "2px 0 0" }}>
                                Qty {item.qty} × ₹{item.price}
                              </p>
                            </div>
                            <span style={{ fontSize: "14px", fontWeight: "700", color: s.primaryText }}>
                              ₹{item.qty * item.price}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Total row */}
                      <div style={{
                        display: "flex", justifyContent: "space-between",
                        marginTop: "12px", paddingTop: "12px",
                        borderTop: `1px solid ${s.cardBorder}`,
                      }}>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: s.secondaryText }}>Total Paid</span>
                        <span style={{ fontSize: "16px", fontWeight: "800", color: s.totalColor }}>₹{order.total}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: "12px", color: s.secondaryText, marginTop: "32px", opacity: 0.6 }}>
          Powered by QuickShop · TeamsInfo CRM
        </p>
      </div>
    </div>
  );
};

export default CustomerOrders;