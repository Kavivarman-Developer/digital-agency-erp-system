import { configureStore } from "@reduxjs/toolkit";
import tasksReducer from "../features/tasksSlice";
import leaveReducer from "../features/leaveSlice";

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    leave: leaveReducer
  }
});

export default store;
