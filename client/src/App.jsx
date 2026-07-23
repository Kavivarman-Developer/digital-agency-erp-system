import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Manager from "./pages/Manager";
import User from "./pages/User";
import ProtectedRoute from "./components/ProtectedRoute";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import { Toaster } from "react-hot-toast";
import Leaves from "./pages/Leaves";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Templates from "./pages/Templates";
import CustomerHome from "./pages/customer/CustomerHome";
import CustomerCart from "./pages/customer/CustomerCart";
import CustomerCheckout from "./pages/customer/CustomerCheckout";
import CustomerOrders from "./pages/customer/CustomerOrders";
import CustomerLogin from "./pages/customer/CustomerLogin";
import CustomerRegister from "./pages/CustomerRegister";
import Admin from "./pages/Admin";
import Advertisements from "./pages/Advertisements";
import Settings from "./pages/Settings";
import CustomerFavorites from "./pages/Customerfavorites";

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <BrowserRouter>
        <Routes>
          {/* ── Auth ────────────────────────────────────────── */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── CRM Internal pages ──────────────────────────── */}
          <Route path="/clients" element={<Clients />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/leaves" element={<Leaves />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/settings" element={<Settings />} />

          {/* ── Advertisements — CRM admin page ─────────────── */}
          <Route path="/advertisements" element={<Advertisements />} />

          {/* ── Customer Portal ──────────────────────────────── */}
          <Route path="/shop/login" element={<CustomerLogin />} />
          <Route path="/shop/register" element={<CustomerRegister />} />

          <Route path="/shop" element={
            <ProtectedRoute role="customer"><CustomerHome /></ProtectedRoute>
          } />

          {/* ── Favorites — enabled only if shop_wishlist is ON ─ */}
          <Route path="/shop/favorites" element={
            <ProtectedRoute role="customer" requireAuth={true}>
              <CustomerFavorites />
            </ProtectedRoute>
          } />

          {/* PROTECTED — login required */}
          <Route path="/shop/cart" element={
            <ProtectedRoute role="customer" requireAuth={true}><CustomerCart /></ProtectedRoute>
          } />
          <Route path="/shop/checkout" element={
            <ProtectedRoute role="customer" requireAuth={true}><CustomerCheckout /></ProtectedRoute>
          } />
          <Route path="/shop/orders" element={
            <ProtectedRoute role="customer" requireAuth={true}><CustomerOrders /></ProtectedRoute>
          } />

          {/* ── Role-based CRM routes ────────────────────────── */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin"><Admin /></ProtectedRoute>
          } />
          <Route path="/manager" element={
            <ProtectedRoute role="manager"><Manager /></ProtectedRoute>
          } />
          <Route path="/user" element={
            <ProtectedRoute role="user"><User /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;