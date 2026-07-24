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
import Admin from "./pages/Admin";
import Advertisements from "./pages/Advertisements";
import Settings from "./pages/Settings";
import CustomerInsights from "./pages/CustomerInsights";

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <BrowserRouter>
        <Routes>
          {/* ── Auth ────────────────────────────────────────── */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── CRM Internal pages — admin + manager mattum ──── */}
          <Route path="/clients" element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}><Clients /></ProtectedRoute>
          } />
          <Route path="/projects" element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}><Projects /></ProtectedRoute>
          } />
          <Route path="/tasks" element={
            <ProtectedRoute allowedRoles={["admin", "manager", "user"]}><Tasks /></ProtectedRoute>
          } />
          <Route path="/leaves" element={
            <ProtectedRoute allowedRoles={["admin", "manager", "user"]}><Leaves /></ProtectedRoute>
          } />
          <Route path="/products" element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}><Products /></ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}><Orders /></ProtectedRoute>
          } />
          <Route path="/customers" element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}><Customers /></ProtectedRoute>
          } />
          <Route path="/templates" element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}><Templates /></ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={["admin"]}><Settings /></ProtectedRoute>
          } />
          <Route path="/advertisements" element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}><Advertisements /></ProtectedRoute>
          } />
          <Route path="/admin/customer-insights" element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}><CustomerInsights /></ProtectedRoute>
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

          {/* ── Catch-all: unknown/unauthorized routes → login ── */}
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;