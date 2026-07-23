// ============================================================
// orderSlice.js — Orders Redux State
// Orders இப்போது DB-ல் save ஆகும். Redux-ல் CRM view மட்டும்.
// ============================================================

import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import axios from "axios";

// ── Async Thunk: GET /api/orders (CRM admin — எல்லா orders) ──
export const fetchOrders = createAsyncThunk(
  "orders/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch orders");
    }
  }
);

// ── Async Thunk: PATCH /api/orders/:id (status / payment update) ──
export const updateOrderAPI = createAsyncThunk(
  "orders/update",
  async ({ id, ...updateData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(`${import.meta.env.VITE_API_URL}/orders/${id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to update order");
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────
const orderSlice = createSlice({
  name: "orders",

  initialState: {
    items:   [],
    loading: false,
    error:   null,
  },

  reducers: {
    // Local optimistic update — API response வரும் முன்பே UI-ல் காட்ட (optional)
    updateOrderStatus(state, action) {
      const { id, status } = action.payload;
      const order = state.items.find((o) => o._id === id || o.id === id);
      if (order) order.status = status;
    },

    updatePaymentStatus(state, action) {
      const { id, paymentStatus } = action.payload;
      const order = state.items.find((o) => o._id === id || o.id === id);
      if (order) order.paymentStatus = paymentStatus;
    },
  },

  extraReducers: (builder) => {
    // ── fetchOrders ──
    builder
      .addCase(fetchOrders.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchOrders.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchOrders.rejected,  (state, action) => { state.loading = false; state.error = action.payload; })

    // ── updateOrderAPI — DB response-ஐ Redux-ல் sync ஆக்குகிறோம் ──
      .addCase(updateOrderAPI.fulfilled, (state, action) => {
        const idx = state.items.findIndex(
          (o) => o._id === action.payload._id
        );
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

// ── Actions Export ────────────────────────────────────────────
export const { updateOrderStatus, updatePaymentStatus } = orderSlice.actions;

// ── Selectors ─────────────────────────────────────────────────
export const selectAllOrders    = (state) => state.orders.items;
export const selectOrdersLoading= (state) => state.orders.loading;
export const selectOrdersError  = (state) => state.orders.error;

export const selectTotalEarnings = createSelector(
  selectAllOrders,
  (items) => items
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.total, 0)
);

export const selectUnpaidOrders = createSelector(
  selectAllOrders,
  (items) => items.filter((o) => o.paymentStatus === "unpaid")
);

// ── Reducer Export ────────────────────────────────────────────
export default orderSlice.reducer;