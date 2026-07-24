import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/axios";

// 🔄 LOGIN thunk
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await API.post("/auth/login", { email, password });
      return res.data; // { token, role, name }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || err.response?.data || "Login failed"
      );
    }
  }
);

const initialState = {
  token: localStorage.getItem("token") || null,
  role: localStorage.getItem("role") || null,
  email: localStorage.getItem("email") || null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.role = null;
      state.email = null;
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("email");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.role = action.payload.role;
        state.email = action.meta.arg.email; // login call panna email

        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("role", action.payload.role);
        localStorage.setItem("email", action.meta.arg.email);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;