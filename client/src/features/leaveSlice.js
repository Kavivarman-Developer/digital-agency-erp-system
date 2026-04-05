import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  applyLeaveAPI,
  getLeavesAPI,
  getAllLeavesAPI,
  approveLeaveAPI,
} from "./leaveAPI";

// APPLY LEAVE
export const applyLeave = createAsyncThunk(
  "leave/apply",
  async ({ data }) => {
    return await applyLeaveAPI(data);
  }
);

// GET LEAVES (user's own leaves)
export const fetchLeaves = createAsyncThunk(
  "leave/get",
  async () => {
    return await getLeavesAPI();
  }
);

// GET ALL LEAVES (manager/admin)
export const fetchAllLeaves = createAsyncThunk(
  "leave/getAll",
  async () => {
    return await getAllLeavesAPI();
  }
);

// APPROVE/REJECT LEAVE
export const approveLeave = createAsyncThunk(
  "leave/approve",
  async ({ id, status }) => {
    return await approveLeaveAPI(id, status);
  }
);

const leaveSlice = createSlice({
  name: "leave",
  initialState: {
    leaves: [],
    allLeaves: [],
    loading: false,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      // APPLY
      .addCase(applyLeave.fulfilled, (state, action) => {
        state.leaves.push(action.payload);
      })

      // FETCH USER LEAVES
      .addCase(fetchLeaves.fulfilled, (state, action) => {
        state.leaves = action.payload;
      })

      // FETCH ALL LEAVES
      .addCase(fetchAllLeaves.fulfilled, (state, action) => {
        state.allLeaves = action.payload;
      })

      // APPROVE/REJECT
      .addCase(approveLeave.fulfilled, (state, action) => {
        const index = state.allLeaves.findIndex(
          (l) => l._id === action.payload._id
        );
        if (index !== -1) {
          state.allLeaves[index] = action.payload;
        }
      });
  },
});


export default leaveSlice.reducer;