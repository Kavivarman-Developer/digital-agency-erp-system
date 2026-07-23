// components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";

// 
// Smart ProtectedRoute:
//   role="customer" + requireAuth=false → globally accessible (browse பண்ணலாம்)
//   role="customer" + requireAuth=true  → login கேக்கும் (cart/checkout/orders)
//   role="admin" / "manager" / "user"   → CRM login கேக்கும்
// 
export default function ProtectedRoute({ children, role, requireAuth = false }) {
  const location = useLocation();
  const token    = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // ── Customer routes 
  if (role === "customer") {
    if (!requireAuth) {
      // /shop, /shop/wishlist — globally public, no login needed
      return children;
    }
    // /shop/cart, /shop/checkout, /shop/orders — login required
    if (!token || userRole !== "customer") {
      // redirect to login, remember where they wanted to go
      return <Navigate to="/shop/login" state={{ from: location.pathname }} replace />;
    }
    return children;
  }

  // ── CRM staff routes 
  if (!token) return <Navigate to="/" replace />;
  if (role && role !== userRole) return <Navigate to="/" replace />;
  return children;
}