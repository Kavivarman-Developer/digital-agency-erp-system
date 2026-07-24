// features/customerSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API = import.meta.env.VITE_API_URL.replace("/api", "");
const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ── Async thunk: fetch all customers from backend ─────────────────────────────
export const fetchCustomers = createAsyncThunk(
  "customers/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API}/api/customers`, { headers: authHeader() });
      if (!res.ok) throw new Error("Failed to fetch customers");
      return await res.json(); // returns Customer[] with favorites populated
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const customerSlice = createSlice({
  name: "customers",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },

  reducers: {
    // Local add (after register — optimistic)
    addCustomer(state, action) {
      state.items.unshift({
        ...action.payload,
        orders: 0,
        totalSpent: 0,
        favorites: [],
        joined: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      });
    },

    // Update orders/spend after order placed
    incrementCustomerOrders(state, action) {
      const { id, amount } = action.payload;
      const c = state.items.find((c) => c._id === id || c.id === id);
      if (c) { c.orders += 1; c.totalSpent += amount; }
    },

    // Update favorites count in table after toggle (called from shop)
    setCustomerFavorites(state, action) {
      const { customerId, favorites } = action.payload;
      const c = state.items.find((c) => c._id === customerId || c.id === customerId);
      if (c) c.favorites = favorites;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.items   = action.payload;
      })
      .addCase(fetchCustomers.rejected,  (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });
  },
});

export const { addCustomer, incrementCustomerOrders, setCustomerFavorites } = customerSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectAllCustomers  = (state) => state.customers.items;
export const selectCustomersLoading = (state) => state.customers.loading;
export const selectCustomersError   = (state) => state.customers.error;

export const selectTopCustomers = (state) =>
  [...state.customers.items].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);

export default customerSlice.reducer;
