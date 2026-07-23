import { configureStore } from "@reduxjs/toolkit";
import tasksReducer from "../features/tasksSlice";
import leaveReducer from "../features/leaveSlice";
import cartReducer from "../features/cartSlice";
import orderReducer from "../features/orderSlice";  
import productReducer from "../features/productSlice"; 
import customerReducer from "../features/customerSlice";
import templateReducer from "../features/templateSlice";
import advertisementReducer from "../features/Advertisementslice";

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    leave: leaveReducer,
    cart: cartReducer,
    orders: orderReducer,
    products: productReducer,
    customers: customerReducer,
    templates: templateReducer,
    advertisements: advertisementReducer
  }
});

export default store;
