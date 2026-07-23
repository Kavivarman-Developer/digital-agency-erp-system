// ============================================================
// productSlice.js — Products Redux State
// DB-இல் இருந்து fetch பண்றோம் — dummy data இல்லை
// ============================================================

import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import axios from "axios";

// ── Async Thunk: GET /api/products/all (CRM admin)
//    CustomerHome பயன்படுத்தும் GET /api/products → தனியே axios call
export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      // CustomerHome → public route (active products மட்டும்)
      const res = await axios.get("http://localhost:5000/api/products");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch products");
    }
  }
);

// CRM admin — inactive-உம் சேர்த்து எல்லாம் பாக்க
export const fetchAllProducts = createAsyncThunk(
  "products/fetchAllAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/products/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch products");
    }
  }
);

// CRM admin — product create
export const createProductAPI = createAsyncThunk(
  "products/create",
  async (productData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/products", productData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to create product");
    }
  }
);

// CRM admin — product update
export const updateProductAPI = createAsyncThunk(
  "products/update",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:5000/api/products/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to update product");
    }
  }
);

// CRM admin — product delete
export const deleteProductAPI = createAsyncThunk(
  "products/delete",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id; // deleted id-ஐ திரும்ப அனுப்புகிறோம்
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to delete product");
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────
const productSlice = createSlice({
  name: "products",

  initialState: {
    items:   [],
    loading: false,
    error:   null,
  },

  reducers: {
    // Optimistic local stock update (optional — order place ஆனப்பறம் use ஆகும்)
    updateStock(state, action) {
      const { id, stock } = action.payload;
      const product = state.items.find((p) => p._id === id || p.id === id);
      if (product) product.stock = Number(stock);
    },
  },

  extraReducers: (builder) => {
    // ── fetchProducts (CustomerHome public) ──
    builder
      .addCase(fetchProducts.pending,  (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchProducts.fulfilled,(state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

    // ── fetchAllProducts (CRM admin) ──
      .addCase(fetchAllProducts.pending,  (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchAllProducts.fulfilled,(state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchAllProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

    // ── createProductAPI ──
      .addCase(createProductAPI.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })

    // ── updateProductAPI ──
      .addCase(updateProductAPI.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })

    // ── deleteProductAPI ──
      .addCase(deleteProductAPI.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p._id !== action.payload && p.id !== action.payload);
      });
  },
});

export const { updateStock } = productSlice.actions;

// ── Selectors ─────────────────────────────────────────────────
// createSelector: input (items) மாறாவிட்டால் cached result return ஆகும்
// filter() நேரடியாக எழுதினால் render ஒவ்வொரு முறையும் new array
// reference return ஆகும் → "Selector returned different result" warning
export const selectAllProducts     = (state) => state.products.items;
export const selectProductsLoading = (state) => state.products.loading;
export const selectProductsError   = (state) => state.products.error;

export const selectLowStock = createSelector(
  selectAllProducts,
  (items) => items.filter((p) => p.stock < 5)
);

export const selectProductById = (id) => (state) =>
  state.products.items.find((p) => p._id === id || p.id === id);

export default productSlice.reducer;