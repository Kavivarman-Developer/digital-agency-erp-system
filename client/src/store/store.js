import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import tasksReducer from "../features/tasksSlice";
import leaveReducer from "../features/leaveSlice";
import orderReducer from "../features/orderSlice";
import productReducer from "../features/productSlice";
import customerReducer from "../features/customerSlice";
import templateReducer from "../features/templateSlice";
import advertisementReducer from "../features/Advertisementslice";
import customerInterestReducer from "../features/customerInterestSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
    leave: leaveReducer,
    orders: orderReducer,
    products: productReducer,
    customers: customerReducer,
    templates: templateReducer,
    advertisements: advertisementReducer,
    customerInterest: customerInterestReducer,
  }
});

export default store;
