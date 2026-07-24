import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import CustomerHome from "./pages/customer/CustomerHome";
import CustomerCart from "./pages/customer/CustomerCart";
import CustomerCheckout from "./pages/customer/CustomerCheckout";
import CustomerOrders from "./pages/customer/CustomerOrders";
import CustomerLogin from "./pages/customer/CustomerLogin";
import CustomerRegister from "./pages/CustomerRegister";
import CustomerFavorites from "./pages/Customerfavorites";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <BrowserRouter>
        <Routes>
          {/* Customer app root - "/" prefix venam, idhu already separate app */}
          <Route path="/" element={
            <ProtectedRoute role="customer"><CustomerHome /></ProtectedRoute>
          } />
          <Route path="/login" element={<CustomerLogin />} />
          <Route path="/register" element={<CustomerRegister />} />

          <Route path="/favorites" element={
            <ProtectedRoute role="customer" requireAuth={true}>
              <CustomerFavorites />
            </ProtectedRoute>
          } />
          <Route path="/cart" element={
            <ProtectedRoute role="customer" requireAuth={true}><CustomerCart /></ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute role="customer" requireAuth={true}><CustomerCheckout /></ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute role="customer" requireAuth={true}><CustomerOrders /></ProtectedRoute>
          } />

          {/* Unknown route → customer login */}
          <Route path="*" element={<CustomerLogin />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
