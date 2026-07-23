import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAllOrders,
  selectTotalEarnings,
  selectUnpaidOrders,
  fetchOrders,
  updateOrderAPI,
} from "../features/orderSlice";
import Layout from "../components/layout/Layout";

const STATUS_FLOW = ["pending", "accepted", "shipped", "delivered"];

const STATUS_COLORS = {
  pending:   { bg: "#fef3c7", text: "#92400e" },
  accepted:  { bg: "#dbeafe", text: "#1e40af" },
  shipped:   { bg: "#e0e7ff", text: "#3730a3" },
  delivered: { bg: "#d1fae5", text: "#065f46" },
};

// ✅ Date filter options
const DATE_FILTERS = [
  { label: "Today",      value: "today" },
  { label: "Yesterday",  value: "yesterday" },
  { label: "This Week",  value: "week" },
  { label: "This Month", value: "month" },
  { label: "All Time",   value: "all" },
];

const isSameDay = (d1, d2) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth()    === d2.getMonth()    &&
  d1.getDate()     === d2.getDate();

const matchesDateFilter = (order, dateFilter) => {
  if (dateFilter === "all") return true;
  const orderDate = new Date(order.createdAt);
  const now       = new Date();

  if (dateFilter === "today") return isSameDay(orderDate, now);

  if (dateFilter === "yesterday") {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    return isSameDay(orderDate, yesterday);
  }

  if (dateFilter === "week") {
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return orderDate >= weekAgo;
  }

  if (dateFilter === "month") {
    return (
      orderDate.getMonth()    === now.getMonth() &&
      orderDate.getFullYear() === now.getFullYear()
    );
  }

  return true;
};

const Orders = () => {
  const dispatch = useDispatch();
  const orders   = useSelector(selectAllOrders);
  const earnings = useSelector(selectTotalEarnings);
  const unpaid   = useSelector(selectUnpaidOrders);

  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("all");
  const [dateFilter, setDateFilter] = useState("today"); // ✅ default: today

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const filtered = orders.filter((o) => {
    const id = o._id || o.id || "";
    const matchSearch =
      o.customer?.toLowerCase().includes(search.toLowerCase()) ||
      id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === "all" || o.status === filter;
    const matchDate   = matchesDateFilter(o, dateFilter);
    return matchSearch && matchStatus && matchDate;
  });

  const handleNextStatus = (order) => {
    const idx = STATUS_FLOW.indexOf(order.status);
    if (idx < STATUS_FLOW.length - 1) {
      dispatch(updateOrderAPI({ id: order._id || order.id, status: STATUS_FLOW[idx + 1] }));
    }
  };

  const handleTogglePayment = (order) => {
    dispatch(updateOrderAPI({
      id: order._id || order.id,
      paymentStatus: order.paymentStatus === "paid" ? "unpaid" : "paid",
    }));
  };

  // Today's orders count for stats
  const todayOrders = orders.filter((o) => matchesDateFilter(o, "today"));

  return (
    <Layout>
      <div style={styles.page}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Orders</h1>
            <p style={styles.subtitle}>{orders.length} total orders</p>
          </div>
          {/* ✅ Date filter tabs — top right */}
          <div style={styles.dateTabs}>
            {DATE_FILTERS.map((d) => (
              <button
                key={d.value}
                style={{
                  ...styles.dateTab,
                  ...(dateFilter === d.value ? styles.dateTabActive : {}),
                }}
                onClick={() => setDateFilter(d.value)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          <StatCard label="Total Orders"   value={orders.length}                                     icon="📋" color="#e0e7ff" />
          <StatCard label="Total Earnings" value={`₹${earnings.toLocaleString()}`}                   icon="💰" color="#d1fae5" />
          <StatCard label="Unpaid Orders"  value={unpaid.length}                                     icon="⚠️" color="#fef3c7" />
          <StatCard label="Today's Orders" value={todayOrders.length}                                icon="🕐" color="#fee2e2" />
        </div>

        {/* Status Filters + Search */}
        <div style={styles.toolbar}>
          <div style={styles.filterTabs}>
            {["all", ...STATUS_FLOW].map((f) => (
              <button
                key={f}
                style={{ ...styles.tab, ...(filter === f ? styles.tabActive : {}) }}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <input
            style={styles.search}
            placeholder="Search order or customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Showing label */}
        <div style={styles.showingLabel}>
          Showing <strong>{filtered.length}</strong> order{filtered.length !== 1 ? "s" : ""} —{" "}
          <span style={{ color: "#4f46e5" }}>
            {DATE_FILTERS.find((d) => d.value === dateFilter)?.label}
          </span>
        </div>

        {/* Table */}
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["Order ID", "Customer", "Date", "Amount", "Payment", "Status", "Actions"].map(
                  (h) => <th key={h} style={styles.th}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const id     = o._id || o.id || "";
                const sc     = STATUS_COLORS[o.status] || {};
                const isLast = o.status === "delivered";
                return (
                  <tr key={id} style={styles.tr}>
                    <td style={styles.td}>
                      <code style={styles.orderId}>#{id.slice(-8).toUpperCase()}</code>
                    </td>
                    <td style={styles.td}>{o.customer}</td>
                    <td style={styles.td}>
                      {o.createdAt
                        ? new Date(o.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td style={styles.td}><strong>₹{o.total}</strong></td>
                    <td style={styles.td}>
                      <div style={styles.paymentCell}>
                        <span>{o.payment}</span>
                        <span
                          style={{
                            ...styles.payBadge,
                            background: o.paymentStatus === "paid" ? "#d1fae5" : "#fee2e2",
                            color:      o.paymentStatus === "paid" ? "#065f46" : "#991b1b",
                            cursor: "pointer",
                          }}
                          onClick={() => handleTogglePayment(o)}
                          title="Click to toggle"
                        >
                          {o.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statusBadge, background: sc.bg, color: sc.text }}>
                        {o.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {!isLast ? (
                        <button style={styles.nextBtn} onClick={() => handleNextStatus(o)}>
                          → {STATUS_FLOW[STATUS_FLOW.indexOf(o.status) + 1]}
                        </button>
                      ) : (
                        <span style={styles.doneText}>✓ Done</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={styles.empty}>
              No orders found for <strong>{DATE_FILTERS.find(d => d.value === dateFilter)?.label}</strong>.
            </div>
          )}
        </div>
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
  page:          { padding: "24px", fontFamily: "'Segoe UI', sans-serif", color: "#1a1a2e" },
  header:        { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" },
  title:         { fontSize: "26px", fontWeight: "700", margin: 0 },
  subtitle:      { color: "#6b7280", margin: "4px 0 0", fontSize: "14px" },
  dateTabs:      { display: "flex", gap: "6px", flexWrap: "wrap" },
  dateTab:       { padding: "6px 14px", borderRadius: "20px", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: "500", color: "#6b7280" },
  dateTabActive: { background: "#1a1a2e", color: "#fff", border: "1px solid #1a1a2e" },
  statsRow:      { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "20px" },
  statCard:      { borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px" },
  statIcon:      { fontSize: "26px" },
  statValue:     { fontSize: "22px", fontWeight: "700" },
  statLabel:     { fontSize: "12px", color: "#6b7280", marginTop: "2px" },
  toolbar:       { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", gap: "12px", flexWrap: "wrap" },
  filterTabs:    { display: "flex", gap: "8px" },
  tab:           { padding: "7px 16px", borderRadius: "20px", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: "500", color: "#6b7280" },
  tabActive:     { background: "#4f46e5", color: "#fff", border: "1px solid #4f46e5" },
  search:        { padding: "9px 14px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", minWidth: "220px" },
  showingLabel:  { fontSize: "13px", color: "#6b7280", marginBottom: "12px" },
  tableWrap:     { background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
  table:         { width: "100%", borderCollapse: "collapse" },
  th:            { textAlign: "left", padding: "12px 16px", fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" },
  tr:            { borderBottom: "1px solid #f3f4f6" },
  td:            { padding: "13px 16px", fontSize: "14px", verticalAlign: "middle" },
  orderId:       { background: "#f3f4f6", padding: "3px 8px", borderRadius: "4px", fontSize: "12px" },
  paymentCell:   { display: "flex", flexDirection: "column", gap: "4px" },
  payBadge:      { borderRadius: "20px", padding: "2px 10px", fontSize: "11px", fontWeight: "600", display: "inline-block", width: "fit-content" },
  statusBadge:   { borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: "600" },
  nextBtn:       { background: "#ede9fe", color: "#6d28d9", border: "none", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  doneText:      { color: "#059669", fontSize: "13px", fontWeight: "600" },
  empty:         { textAlign: "center", padding: "48px", color: "#9ca3af", fontSize: "15px" },
};

export default Orders;