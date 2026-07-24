import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCartItems, addToCart, removeFromCart, clearCart } from "../../features/cartSlice";
import { Link } from "react-router-dom";

const CustomerCart = () => {
  const cartItems  = useSelector(selectCartItems);
  const dispatch   = useDispatch();

  const totalPrice    = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const totalItems    = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const totalSavings  = cartItems.reduce((acc, item) => acc + ((item.mrp || item.price) - item.price) * item.qty, 0);

  return (
    <div className="min-h-screen bg-[#f1f3f6]">

      {/* ── Top Nav ── */}
      <header className="bg-[#2874f0] sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="flex-shrink-0">
            <span className="text-white font-extrabold text-xl tracking-tight leading-none">
              Quick<span className="text-[#ffe500]">Shop</span>
            </span>
          </Link>
          <div className="flex-1" />
          <Link to="/" className="text-white/80 hover:text-white text-sm font-medium flex items-center gap-1.5 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Continue Shopping
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-5">

        {/* ── Page Title ── */}
        <div className="flex items-center gap-3 mb-5">
          <h1 className="text-xl font-bold text-slate-800">My Cart</h1>
          {cartItems.length > 0 && (
            <span className="bg-[#2874f0] text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {totalItems} item{totalItems > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* ── Empty State ── */}
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center py-24 px-6 text-center">
            <div className="w-28 h-28 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-14 h-14 text-[#2874f0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h13M10 21a1 1 0 1 0 2 0 1 1 0 0 0-2 0zm7 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">Your cart is empty!</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">Add items to it now. Shop today's best deals!</p>
            <Link
              to="/"
              className="bg-[#2874f0] hover:bg-[#1a5dc7] text-white px-10 py-3 rounded-sm font-bold text-sm transition shadow"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

            {/* ── LEFT: Cart Items ── */}
            <div className="lg:col-span-2 space-y-3">

              {/* Delivery Banner */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 px-5 py-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm7 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                  <path d="M15.25 2.5H4.75A2.25 2.25 0 0 0 2.5 4.75v7.5A2.25 2.25 0 0 0 4.75 14.5H5a2.5 2.5 0 0 1 5 0h5a2.5 2.5 0 0 1 5 0h.25a2.25 2.25 0 0 0 2.25-2.25v-7.5A2.25 2.25 0 0 0 15.25 2.5z" />
                </svg>
                <span className="text-xs text-slate-600">
                  Delivery by <strong className="text-slate-800">Tomorrow</strong> — 
                  <span className="text-green-600 font-semibold ml-1">FREE</span> on orders above ₹499
                </span>
              </div>

              {/* Items */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 divide-y divide-slate-50">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-5 flex gap-4 hover:bg-slate-50/60 transition-colors group">

                    {/* Image */}
                    <div className="w-24 h-24 bg-[#f8f9fa] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-100">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <span className="text-3xl text-slate-200">📦</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug mb-1">{item.name}</h3>

                      {/* Seller tag */}
                      <p className="text-xs text-slate-400 mb-2">Seller: QuickShop Official</p>

                      {/* Price */}
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-lg font-extrabold text-slate-900">₹{item.price.toLocaleString("en-IN")}</span>
                        {item.mrp && item.mrp > item.price && (
                          <>
                            <span className="text-xs text-slate-400 line-through">₹{item.mrp.toLocaleString("en-IN")}</span>
                            <span className="text-xs text-green-600 font-bold">
                              {Math.round(((item.mrp - item.price) / item.mrp) * 100)}% off
                            </span>
                          </>
                        )}
                      </div>

                      {/* Qty Controls + Remove */}
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center border border-slate-200 rounded-sm overflow-hidden">
                          <button
                            onClick={() => dispatch(removeFromCart(item.id))}
                            className="w-8 h-8 flex items-center justify-center text-[#2874f0] font-bold text-lg hover:bg-blue-50 transition"
                          >
                            −
                          </button>
                          <span className="w-10 h-8 flex items-center justify-center text-sm font-bold text-slate-800 border-x border-slate-200 bg-white">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => dispatch(addToCart(item))}
                            className="w-8 h-8 flex items-center justify-center text-[#2874f0] font-bold text-lg hover:bg-blue-50 transition"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            for (let i = 0; i < item.qty; i++) dispatch(removeFromCart(item.id));
                          }}
                          className="text-xs text-slate-500 hover:text-red-500 font-semibold transition flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <p className="text-xs text-slate-400 mb-1">Subtotal</p>
                      <p className="text-base font-extrabold text-slate-900">
                        ₹{(item.price * item.qty).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Clear Cart */}
              <div className="flex justify-end">
                <button
                  onClick={() => dispatch(clearCart())}
                  className="text-xs text-slate-400 hover:text-red-500 font-semibold transition flex items-center gap-1.5 py-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
                  </svg>
                  Remove all items
                </button>
              </div>
            </div>

            {/* ── RIGHT: Price Summary ── */}
            <div className="space-y-3">

              {/* Savings Banner */}
              {totalSavings > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
                  <span className="text-green-600 text-lg">🏷️</span>
                  <p className="text-green-700 text-sm font-semibold">
                    You're saving <span className="font-extrabold">₹{totalSavings.toLocaleString("en-IN")}</span> on this order!
                  </p>
                </div>
              )}

              {/* Price Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-50">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Price Details</h2>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Price ({totalItems} item{totalItems > 1 ? "s" : ""})</span>
                    <span className="font-medium text-slate-800">₹{totalPrice.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Delivery Charges</span>
                    <span className="text-green-600 font-semibold">
                      {totalPrice >= 499 ? "FREE" : "₹40"}
                    </span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Discount</span>
                      <span className="text-green-600 font-semibold">− ₹{totalSavings.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between">
                    <span className="text-base font-extrabold text-slate-900">Total Amount</span>
                    <span className="text-base font-extrabold text-slate-900">
                      ₹{(totalPrice + (totalPrice >= 499 ? 0 : 40) - 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <div className="px-5 pb-5">
                  <Link
                    to="/checkout"
                    className="block w-full bg-[#fb641b] hover:bg-[#e85a16] text-white text-center py-3.5 font-extrabold text-sm rounded-sm transition shadow-md shadow-orange-200 tracking-wide"
                  >
                    PLACE ORDER →
                  </Link>
                  <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
                    <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0 1 10 0v2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2zm8-2v2H7V7a3 3 0 0 1 6 0z" />
                    </svg>
                    Safe & Secure Payments
                  </p>
                </div>
              </div>

              {/* Trust badges */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 px-5 py-4 space-y-3">
                {[
                  { icon: "✅", text: "100% Purchase Protection" },
                  { icon: "🔄", text: "Easy 7-day Returns" },
                  { icon: "🚚", text: "Fast & Reliable Delivery" },
                ].map((b) => (
                  <div key={b.text} className="flex items-center gap-3 text-xs text-slate-600">
                    <span className="text-base">{b.icon}</span>
                    <span className="font-medium">{b.text}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerCart;
