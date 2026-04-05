import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "http://localhost:5000/api/tasks";

export const fetchMyTasks = createAsyncThunk("tasks/fetchMy", async () => {
  const res = await axios.get(`${API}/my`);
  return res.data;
});

export const completeTask = createAsyncThunk("tasks/complete", async (taskId) => {
  const res = await axios.post(`${API}/${taskId}/complete`, {});
  return res.data;
});

const tasksSlice = createSlice({
  name: "tasks",
  initialState: { items: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyTasks.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMyTasks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchMyTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(completeTask.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex(t => t._id === updated._id);
        if (idx !== -1) state.items[idx] = updated;
      });
  }
});

export default tasksSlice.reducer;
