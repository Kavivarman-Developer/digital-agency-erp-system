import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "../features/cartSlice";
import productReducer from "../features/productSlice";
import customerReducer from "../features/customerSlice";
import advertisementReducer from "../features/Advertisementslice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    products: productReducer,
    customer: customerReducer,
    advertisements: advertisementReducer,
  }
});

export default store;

