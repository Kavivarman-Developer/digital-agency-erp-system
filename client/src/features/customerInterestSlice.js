import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/axios";

export const fetchCustomerInterests = createAsyncThunk(
  "customerInterest/fetch",
  async (customerId, { rejectWithValue }) => {
    try {
      const res = await API.get(`/activity/${customerId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch interests");
    }
  }
);

const customerInterestSlice = createSlice({
  name: "customerInterest",
  initialState: { topCategories: [], topProducts: [], loading: false, error: null },
  reducers: {
    clearInterests: (state) => {
      state.topCategories = [];
      state.topProducts = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerInterests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerInterests.fulfilled, (state, action) => {
        state.loading = false;
        state.topCategories = action.payload.topCategories;
        state.topProducts = action.payload.topProducts;
      })
      .addCase(fetchCustomerInterests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearInterests } = customerInterestSlice.actions;
export default customerInterestSlice.reducer;