// features/advertisementSlice.js
import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import axios from "axios";

const BASE = `${import.meta.env.VITE_API_URL}/advertisements`;

// ─────────────────────────────────────────────────────────────────────────────
// Async Thunks
// ─────────────────────────────────────────────────────────────────────────────

// PUBLIC — CustomerHome active banners fetch
export const fetchActiveAds = createAsyncThunk(
  "advertisements/fetchActive",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(BASE);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch ads");
    }
  }
);

// ADMIN — All ads (CRM)
export const fetchAllAds = createAsyncThunk(
  "advertisements/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE}/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch ads");
    }
  }
);

// ADMIN — Create
export const createAdAPI = createAsyncThunk(
  "advertisements/create",
  async (data, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(BASE, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to create ad");
    }
  }
);

// ADMIN — Update
export const updateAdAPI = createAsyncThunk(
  "advertisements/update",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${BASE}/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to update ad");
    }
  }
);

// ADMIN — Delete
export const deleteAdAPI = createAsyncThunk(
  "advertisements/delete",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to delete ad");
    }
  }
);

// PUBLIC — Track click (fire and forget — no Redux state change needed)
export const trackAdClick = (id) => async () => {
  try {
    await axios.post(`${BASE}/${id}/click`);
  } catch (_) {
    // Silently fail — analytics should never break UX
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────────
const advertisementSlice = createSlice({
  name: "advertisements",

  initialState: {
    items:   [],
    loading: false,
    error:   null,
  },

  reducers: {},

  extraReducers: (builder) => {
    // fetchActiveAds
    builder
      .addCase(fetchActiveAds.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchActiveAds.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchActiveAds.rejected,  (state, action) => { state.loading = false; state.error = action.payload; })

    // fetchAllAds
      .addCase(fetchAllAds.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchAllAds.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchAllAds.rejected,  (state, action) => { state.loading = false; state.error = action.payload; })

    // create
      .addCase(createAdAPI.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })

    // update
      .addCase(updateAdAPI.fulfilled, (state, action) => {
        const idx = state.items.findIndex((a) => a._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })

    // delete
      .addCase(deleteAdAPI.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a._id !== action.payload);
      });
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Selectors
// ─────────────────────────────────────────────────────────────────────────────
export const selectAllAds     = (state) => state.advertisements.items;
export const selectAdsLoading = (state) => state.advertisements.loading;
export const selectAdsError   = (state) => state.advertisements.error;

// Hero banners (position = "hero") — CustomerHome main banner-ல் காட்ட
export const selectHeroAds = createSelector(
  selectAllAds,
  (items) => items.filter((a) => a.position === "hero")
);

// Top banners
export const selectTopBannerAds = createSelector(
  selectAllAds,
  (items) => items.filter((a) => a.position === "top-banner")
);

// Mid banners (products-க்கு நடுவே காட்ட)
export const selectMidBannerAds = createSelector(
  selectAllAds,
  (items) => items.filter((a) => a.position === "mid-banner")
);

export default advertisementSlice.reducer;