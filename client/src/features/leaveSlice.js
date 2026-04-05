import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ CORRECTED: Get token from localStorage with validation check
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    // ✅ CORRECTED: Check if token exists before sending
    if (!token) {
        console.warn("⚠️ No authorization token found in localStorage!");
        console.warn("💡 Please login first to access leave features.");
        return null; // Return null if no token - caller should handle this
    }

    // ✅ CORRECTED: Return proper authorization header format
    return {
        Authorization: `Bearer ${token}`
    };
};

export const applyLeave = createAsyncThunk(
    "leave/applyLeave",
    async (data, thunkAPI) => {
        try {
            // ✅ CORRECTED: Get validated auth headers
            const headers = getAuthHeaders();

            if (!headers) {
                // ✅ CORRECTED: Reject if no token available
                return thunkAPI.rejectWithValue({
                    message: "⚠️ Please login first to apply for leave"
                });
            }

            const res = await axios.post("http://localhost:5000/api/leaves/apply", data, {
                headers
            })
            return res.data;
        } catch (error) {
            // ✅ CORRECTED: Better error handling for 401 Unauthorized
            if (error.response?.status === 401) {
                console.error("❌ Unauthorized! Session may have expired. Please login again.");
            } else if (error.response?.status === 400) {
                console.error("❌ Bad Request:", error.response.data);
            }
            return thunkAPI.rejectWithValue(error.response?.data || error.message || "Failed to apply leave");
        }
    }
);

export const fetchLeaves = createAsyncThunk(
    "leave/fetchLeaves",
    async (_, thunkAPI) => {
        try {
            // ✅ CORRECTED: Get validated auth headers
            const headers = getAuthHeaders();

            if (!headers) {
                return { leaves: [] };
            }

            const res = await axios.get("http://localhost:5000/api/leaves/my-leaves", {
                headers
            });
            return res.data;
        } catch (error) {
            // ✅ CORRECTED: Better error handling for 401 Unauthorized
            if (error.response?.status === 401) {
                console.error("❌ Unauthorized! Session may have expired. Please login again.");
                return { leaves: [] };
            }
            return thunkAPI.rejectWithValue(error.response?.data || error.message || "Failed to fetch leaves");
        }
    }
);

// ✅ NEW: Fetch all users' leaves (for managers/admins)
export const fetchAllLeaves = createAsyncThunk(
    "leave/fetchAllLeaves",
    async (_, thunkAPI) => {
        try {
            // ✅ CORRECTED: Get validated auth headers
            const headers = getAuthHeaders();

            if (!headers) {
                return { allLeaves: [] };
            }

            const res = await axios.get("http://localhost:5000/api/leaves", {
                headers
            });
            return res.data;
        } catch (error) {
            // ✅ CORRECTED: Better error handling
            if (error.response?.status === 401) {
                console.error("❌ Unauthorized! Only managers/admins can view all leaves.");
                return { allLeaves: [] };
            }
            return thunkAPI.rejectWithValue(error.response?.data || error.message || "Failed to fetch all leaves");
        }
    }
);

const leaveSlice = createSlice({
    name: "leave",
    initialState: {
        leaves: [],
        // ✅ Added: Store all users' leaves for managers/admins
        allLeaves: [],
        loading: false,
        allLoading: false,
        error: null,
        allError: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // ✅ Apply Leave handlers
            .addCase(applyLeave.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(applyLeave.fulfilled, (state, action) => {
                state.loading = false;
                state.leaves.push(action.payload.leave);
            })
            .addCase(applyLeave.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to apply leave";
            })
            // ✅ User's own leaves handlers
            .addCase(fetchLeaves.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchLeaves.fulfilled, (state, action) => {
                state.loading = false;
                state.leaves = action.payload.leaves || [];
            })
            .addCase(fetchLeaves.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // ✅ All users' leaves handlers
            .addCase(fetchAllLeaves.pending, (state) => {
                state.allLoading = true;
            })
            .addCase(fetchAllLeaves.fulfilled, (state, action) => {
                state.allLoading = false;
                // ✅ Handle both possible response formats
                state.allLeaves = action.payload.allLeaves || action.payload.leaves || [];
            })
            .addCase(fetchAllLeaves.rejected, (state, action) => {
                state.allLoading = false;
                state.allError = action.payload;
            });
    }
});

export default leaveSlice.reducer;