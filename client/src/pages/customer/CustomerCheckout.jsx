import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCartItems, clearCart } from "../../features/cartSlice";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const PAYMENT_METHODS = [
  { id: "PhonePe", label: "PhonePe", icon: "📱", sub: "UPI via PhonePe" },
  { id: "UPI",     label: "UPI",     icon: "⚡", sub: "Any UPI app" },
  { id: "Cash",    label: "Cash",    icon: "💵", sub: "Pay on delivery" },
];

const CustomerCheckout = () => {
  const cartItems  = useSelector(selectCartItems);
  const dispatch   = useDispatch();
  const navigate   = useNavigate();

  const [name,    setName]    = useState(localStorage.getItem("customerName") || "");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [payment, setPayment] = useState("PhonePe");
  const [loading, setLoading] = useState(false);
  const [step,    setStep]    = useState(1); // 1 = address, 2 = payment

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const delivery   = totalPrice >= 499 ? 0 : 40;
  const grandTotal = totalPrice + delivery;

  const handlePlaceOrder = async () => {
    if (!name || !address) { alert("Please fill in all fields!"); return; }
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/orders", {
        customer:      name,
        address:       `${address}${pincode ? " - " + pincode : ""}`,
        payment,
        total:         grandTotal,
        paymentStatus: "unpaid",
        status:        "pending",
        items: cartItems.map((item) => ({
          productId: item.id,
          name:      item.name,
          price:     item.price,
          qty:       item.qty,
          image:     item.image || "",
        })),
      });
      localStorage.setItem("customerName", name);
      dispatch(clearCart());
      navigate("/shop/orders");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Empty cart ──
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex flex-col items-center justify-center gap-4 p-6">
        <div className="bg-white rounded-xl shadow-sm p-12 text-center max-w-sm w-full">
          <div className="text-5xl mb-4">🛒</div>
          <p className="text-slate-600 font-semibold mb-1">Your cart is empty</p>
          <p className="text-slate-400 text-sm mb-6">Add items before checkout</p>
          <Link to="/shop" className="bg-[#2874f0] text-white px-8 py-2.5 rounded-sm font-bold text-sm block">
            Go to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6]">

      {/* ── Top Nav ── */}
      <header className="bg-[#2874f0] sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/shop" className="flex-shrink-0">
            <span className="text-white font-extrabold text-xl tracking-tight">
              Quick<span className="text-[#ffe500]">Shop</span>
            </span>
          </Link>
          <div className="flex-1" />
          {/* Step Indicator */}
          <div className="flex items-center gap-2 text-xs font-bold">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? "text-[#ffe500]" : "text-white/40"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${step >= 1 ? "bg-[#ffe500] text-[#2874f0]" : "bg-white/20 text-white"}`}>1</span>
              ADDRESS
            </div>
            <div className={`w-8 h-0.5 ${step >= 2 ? "bg-[#ffe500]" : "bg-white/20"}`} />
            <div className={`flex items-center gap-1.5 ${step >= 2 ? "text-[#ffe500]" : "text-white/40"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${step >= 2 ? "bg-[#ffe500] text-[#2874f0]" : "bg-white/20 text-white"}`}>2</span>
              PAYMENT
            </div>
            <div className="w-8 h-0.5 bg-white/20" />
            <div className="flex items-center gap-1.5 text-white/40">
              <span className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] font-black">3</span>
              CONFIRM
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

          {/* ── LEFT: Steps ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* STEP 1 — Delivery Address */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div
                className={`px-5 py-4 flex items-center justify-between cursor-pointer ${step === 1 ? "bg-white" : "bg-slate-50"}`}
                onClick={() => step > 1 && setStep(1)}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${step > 1 ? "bg-green-500 text-white" : "bg-[#2874f0] text-white"}`}>
                    {step > 1 ? "✓" : "1"}
                  </span>
                  <span className="font-bold text-slate-800 text-sm uppercase tracking-wide">Delivery Address</span>
                </div>
                {step > 1 && (
                  <span className="text-xs text-[#2874f0] font-bold hover:underline">CHANGE</span>
                )}
              </div>

              {step === 1 && (
                <div className="px-5 pb-6 space-y-4 border-t border-slate-50">
                  <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0] transition placeholder:text-slate-300"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Full Delivery Address</label>
                      <textarea
                        rows={3}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House no., Building name, Street, Area..."
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0] transition placeholder:text-slate-300 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Pincode (Optional)</label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="600001"
                        maxLength={6}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0] transition placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!name || !address) { alert("Please fill Name and Address!"); return; }
                      setStep(2);
                    }}
                    className="bg-[#fb641b] hover:bg-[#e85a16] text-white px-10 py-3 font-extrabold text-sm rounded-sm transition shadow-md shadow-orange-100 tracking-wide"
                  >
                    DELIVER HERE
                  </button>
                </div>
              )}

              {step > 1 && (
                <div className="px-5 pb-4 border-t border-slate-50 pt-3">
                  <p className="text-sm font-bold text-slate-800">{name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{address}{pincode && ` — ${pincode}`}</p>
                </div>
              )}
            </div>

            {/* STEP 2 — Payment */}
            <div className={`bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden ${step < 2 ? "opacity-60 pointer-events-none" : ""}`}>
              <div className="px-5 py-4 flex items-center gap-3 border-b border-slate-50">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${step > 2 ? "bg-green-500 text-white" : "bg-[#2874f0] text-white"}`}>
                  {step > 2 ? "✓" : "2"}
                </span>
                <span className="font-bold text-slate-800 text-sm uppercase tracking-wide">Payment Method</span>
              </div>

              {step >= 2 && (
                <div className="px-5 py-5 space-y-3">
                  {PAYMENT_METHODS.map((m) => (
                    <label
                      key={m.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition
                        ${payment === m.id
                          ? "border-[#2874f0] bg-blue-50"
                          : "border-slate-100 hover:border-slate-200 bg-white"
                        }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={m.id}
                        checked={payment === m.id}
                        onChange={() => setPayment(m.id)}
                        className="accent-[#2874f0]"
                      />
                      <span className="text-2xl">{m.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{m.label}</p>
                        <p className="text-xs text-slate-400">{m.sub}</p>
                      </div>
                      {payment === m.id && (
                        <span className="ml-auto text-[#2874f0] text-xs font-bold bg-blue-100 px-2 py-0.5 rounded-full">Selected</span>
                      )}
                    </label>
                  ))}

                  {/* Place Order */}
                  <div className="pt-2">
                    <button
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="w-full bg-[#fb641b] hover:bg-[#e85a16] disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 font-extrabold text-sm rounded-sm transition shadow-md shadow-orange-200 tracking-wide flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Placing your order...
                        </>
                      ) : (
                        `CONFIRM ORDER — ₹${grandTotal.toLocaleString("en-IN")}`
                      )}
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
                      <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0 1 10 0v2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2zm8-2v2H7V7a3 3 0 0 1 6 0z" />
                      </svg>
                      100% Secure · SSL Encrypted
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Order Summary ── */}
          <div className="space-y-3">

            {/* Items Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Order Summary ({totalItems} item{totalItems > 1 ? "s" : ""})
                </h2>
                <Link to="/shop/cart" className="text-xs text-[#2874f0] font-bold hover:underline">Edit</Link>
              </div>
              <div className="divide-y divide-slate-50 max-h-56 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="px-4 py-3 flex gap-3 items-center">
                    <div className="w-12 h-12 bg-[#f8f9fa] rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-100">
                      {item.image
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-contain p-0.5" />
                        : <span className="text-xl text-slate-200">📦</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Qty: {item.qty} × ₹{item.price}</p>
                    </div>
                    <span className="text-sm font-bold text-slate-800 flex-shrink-0">
                      ₹{(item.price * item.qty).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-50">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Price Details</h2>
              </div>
              <div className="px-4 py-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>MRP Total</span>
                  <span className="font-medium text-slate-800">₹{totalPrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span className={`font-semibold ${delivery === 0 ? "text-green-600" : "text-slate-800"}`}>
                    {delivery === 0 ? "FREE" : `₹${delivery}`}
                  </span>
                </div>
                <div className="border-t border-dashed border-slate-200 pt-2.5 flex justify-between">
                  <span className="font-extrabold text-slate-900">Total Payable</span>
                  <span className="font-extrabold text-slate-900">₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Trust */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 px-4 py-4 space-y-2.5">
              {[
                { icon: "✅", text: "Secure Payments" },
                { icon: "🔄", text: "Easy Returns & Refunds" },
                { icon: "🚚", text: "Fast Doorstep Delivery" },
              ].map((b) => (
                <div key={b.text} className="flex items-center gap-2.5 text-xs text-slate-600">
                  <span>{b.icon}</span>
                  <span className="font-medium">{b.text}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCheckout;