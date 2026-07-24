// pages/customer/CustomerHome.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
import { addToCart, selectCartItems } from "../../features/cartSlice";
import {
  fetchProducts, selectAllProducts,
  selectProductsLoading, selectProductsError,
} from "../../features/productSlice";
import {
  fetchActiveAds, trackAdClick,
  selectHeroAds, selectTopBannerAds, selectMidBannerAds, selectAdsLoading,
} from "../../features/Advertisementslice";

// ─────────────────────────────────────────────────────────────────────────────
// Wishlist helpers — localStorage + login-ஆனா sync
// ─────────────────────────────────────────────────────────────────────────────
const WL_KEY = "qs_wishlist"; // localStorage key

const loadWishlist = () => {
  try { return JSON.parse(localStorage.getItem(WL_KEY)) || []; }
  catch { return []; }
};
const saveWishlist = (ids) => {
  try { localStorage.setItem(WL_KEY, JSON.stringify(ids)); } catch {}
};

// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIES    = ["All", "Accessories", "Clothing", "Footwear"];
const SLIDE_INTERVAL = 4000;
const MID_AFTER      = 10;

// ─────────────────────────────────────────────────────────────────────────────
// Login Required Modal — cart/order click-ல் காட்டும்
// ─────────────────────────────────────────────────────────────────────────────
const LoginModal = ({ onClose, onLogin }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
    <div
      className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="text-5xl mb-3">🔐</div>
      <h2 className="text-lg font-bold text-slate-800 mb-1">Sign in to continue</h2>
      <p className="text-slate-400 text-sm mb-6">
        Login பண்ணா cart-ல் add பண்ணி order place பண்ணலாம்!
      </p>
      <button
        onClick={onLogin}
        className="w-full bg-[#2874f0] hover:bg-[#1a5dc7] text-white font-bold py-3 rounded-xl text-sm transition mb-3"
      >
        Sign In →
      </button>
      <button onClick={onClose} className="text-slate-400 text-sm hover:text-slate-600">
        Continue Browsing
      </button>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// HeroBanner
// ─────────────────────────────────────────────────────────────────────────────
const HeroBanner = ({ ads, onCtaClick }) => {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (ads.length <= 1) return;
    const t = setInterval(() => setCurrent((p) => (p + 1) % ads.length), SLIDE_INTERVAL);
    return () => clearInterval(t);
  }, [ads.length]);

  if (ads.length === 0) return (
    <div className="max-w-7xl mx-auto px-4 mt-4">
      <div className="bg-gradient-to-r from-[#2874f0] via-[#1565c0] to-[#0d47a1] rounded-xl overflow-hidden relative h-36 flex items-center px-8 shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #ffe500 0%, transparent 60%)" }} />
        <div className="relative z-10">
          <p className="text-[#ffe500] text-xs font-bold uppercase tracking-widest mb-1">Today's Best Deals</p>
          <h2 className="text-white text-2xl font-extrabold">Up to <span className="text-[#ffe500]">80% OFF</span></h2>
          <p className="text-blue-200 text-sm mt-1">Free delivery on orders above ₹499</p>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 text-7xl opacity-20">🛍️</div>
      </div>
    </div>
  );

  const ad = ads[current];
  return (
    <div className="max-w-7xl mx-auto px-4 mt-4">
      <div className="relative rounded-xl overflow-hidden shadow-lg h-44 sm:h-52 bg-gradient-to-r from-[#2874f0] via-[#1565c0] to-[#0d47a1]">
        {ad.bannerImage && <img src={ad.bannerImage} alt={ad.title} className="absolute inset-0 w-full h-full object-cover opacity-60" />}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-center px-8 max-w-lg">
          {ad.badgeText && <span className="inline-block bg-[#ffe500] text-[#1a1a2e] text-[10px] font-extrabold px-2 py-0.5 rounded mb-2 uppercase w-fit">{ad.badgeText}</span>}
          <p className="text-[#ffe500] text-xs font-bold uppercase tracking-widest mb-1">{ad.subtitle || "Today's Best Deals"}</p>
          <h2 className="text-white text-2xl sm:text-3xl font-extrabold leading-tight">
            {ad.offerText ? <>Up to <span className="text-[#ffe500]">{ad.offerText}</span></> : ad.title}
          </h2>
          {ad.description && <p className="text-blue-100 text-sm mt-1 line-clamp-1">{ad.description}</p>}
          {ad.ctaText && (
            <button onClick={() => onCtaClick(ad)} className="mt-3 w-fit bg-[#ffe500] hover:bg-yellow-400 text-[#1a1a2e] font-bold text-xs px-5 py-2 rounded-full transition active:scale-95 shadow">
              {ad.ctaText} →
            </button>
          )}
        </div>
        {ads.length > 1 && (
          <div className="absolute bottom-3 right-4 flex gap-1.5">
            {ads.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${i === current ? "bg-[#ffe500] w-5" : "bg-white/50 w-2"}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MidBanner
// ─────────────────────────────────────────────────────────────────────────────
const MidBanner = ({ ad, onCtaClick }) => {
  if (!ad) return null;
  return (
    <div className="col-span-full my-2">
      <div className="relative rounded-xl overflow-hidden h-24 flex items-center px-6 shadow cursor-pointer"
        style={{ background: ad.bannerImage ? "transparent" : "linear-gradient(135deg,#ff6b6b,#ee5a24)" }}
        onClick={() => onCtaClick(ad)}>
        {ad.bannerImage && <img src={ad.bannerImage} alt={ad.title} className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex items-center justify-between w-full">
          <div>
            {ad.badgeText && <span className="text-[10px] bg-[#ffe500] text-[#1a1a2e] font-extrabold px-2 py-0.5 rounded uppercase mr-2">{ad.badgeText}</span>}
            <span className="text-white font-extrabold text-lg">{ad.offerText || ad.title}</span>
            {ad.subtitle && <p className="text-white/80 text-xs mt-0.5">{ad.subtitle}</p>}
          </div>
          {ad.ctaText && <span className="bg-white text-[#2874f0] font-bold text-xs px-4 py-2 rounded-full shadow flex-shrink-0">{ad.ctaText} →</span>}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SEO
// ─────────────────────────────────────────────────────────────────────────────
const ShopSEO = ({ heroAds }) => {
  const a   = heroAds[0];
  const t   = a?.seo?.metaTitle       || "QuickShop — India's Best Online Store";
  const d   = a?.seo?.metaDescription || "Shop the latest products at unbeatable prices. Free delivery above ₹499.";
  const kw  = a?.seo?.keywords?.join(", ") || "online shopping, deals, discounts, India";
  const og  = a?.seo?.ogTitle         || t;
  const ogd = a?.seo?.ogDescription   || d;
  const ogi = a?.seo?.ogImage         || a?.bannerImage || "";
  return (
    <Helmet>
      <title>{t}</title>
      <meta name="description" content={d} />
      <meta name="keywords"    content={kw} />
      <meta property="og:title"       content={og} />
      <meta property="og:description" content={ogd} />
      <meta property="og:type"        content="website" />
      {ogi && <meta property="og:image" content={ogi} />}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={og} />
      <meta name="twitter:description" content={ogd} />
      {ogi && <meta name="twitter:image" content={ogi} />}
    </Helmet>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main CustomerHome
// ─────────────────────────────────────────────────────────────────────────────
const CustomerHome = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const products   = useSelector(selectAllProducts);
  const loading    = useSelector(selectProductsLoading);
  const error      = useSelector(selectProductsError);
  const cartItems  = useSelector(selectCartItems);
  const adsLoading    = useSelector(selectAdsLoading);
  const heroAds       = useSelector(selectHeroAds);
  const topBannerAds  = useSelector(selectTopBannerAds);
  const midBannerAds  = useSelector(selectMidBannerAds);

  const [search,     setSearch]     = useState("");
  const [category,   setCategory]   = useState("All");
  const [sortBy,     setSortBy]     = useState("default");
  const [addedId,    setAddedId]    = useState(null);
  const [showModal,  setShowModal]  = useState(false);

  // ── Wishlist state: localStorage-ல் இருந்து load ──────────────────────────
  const [wishlist, setWishlist] = useState(loadWishlist);

  // Wishlist change ஆகும்போது localStorage-ல் save
  useEffect(() => { saveWishlist(wishlist); }, [wishlist]);

  const isLoggedIn = !!(localStorage.getItem("token") && localStorage.getItem("role") === "customer");
  const cartCount  = cartItems.reduce((acc, i) => acc + i.qty, 0);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchActiveAds());
  }, [dispatch]);

  // ── CTA click ──────────────────────────────────────────────────────────────
  const handleCtaClick = useCallback((ad) => {
    dispatch(trackAdClick(ad._id));
    if (ad.ctaLink) {
      if (ad.ctaLink.startsWith("http")) window.open(ad.ctaLink, "_blank", "noopener,noreferrer");
      else navigate(ad.ctaLink);
    }
  }, [dispatch, navigate]);

  // ── Add to Cart — login இல்லன்னா modal காட்டு ──────────────────────────
  const handleAddToCart = (product) => {
    if (!isLoggedIn) { setShowModal(true); return; }
    dispatch(addToCart({ id: product._id, name: product.name, price: product.price, image: product.image, mrp: product.mrp }));
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 1200);
  };

  // ── Cart icon click — login இல்லன்னா modal ─────────────────────────────
  const handleCartClick = () => {
    if (!isLoggedIn) { setShowModal(true); return; }
    navigate("/cart");
  };

  // ── Wishlist toggle ────────────────────────────────────────────────────────
  const toggleWishlist = (id) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  // ── Filter + Sort ──────────────────────────────────────────────────────────
  const filtered = products
    .filter((p) => {
      const ms = p.name.toLowerCase().includes(search.toLowerCase());
      const mc = category === "All" || p.category === category;
      return ms && mc;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc")  return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "name")       return a.name.localeCompare(b.name);
      return 0;
    });

  // ── Discount % — MRP vs Price ─────────────────────────────────────────────
  const calcDiscount = (mrp, price) =>
    mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : null;

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <ShopSEO heroAds={heroAds} />

      {/* Login Required Modal */}
      {showModal && (
        <LoginModal
          onClose={() => setShowModal(false)}
          onLogin={() => navigate("/login", { state: { from: "/" } })}
        />
      )}

      {/* ── NAVBAR ───────────────────────────────────────────────────────── */}
      <header className="bg-[#2874f0] sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex-shrink-0">
            <span className="text-white font-extrabold text-xl tracking-tight">
              Quick<span className="text-[#ffe500]">Shop</span>
            </span>
            <p className="text-[#ffe500] text-[9px] font-medium italic mt-0.5">India's Best Store ✦</p>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center bg-white rounded-sm overflow-hidden shadow-sm">
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for products, brands and more"
                className="flex-1 px-4 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
              <div className="bg-[#2874f0] px-5 py-2.5">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Cart */}
          <button onClick={handleCartClick} className="flex items-center gap-2 text-white hover:text-[#ffe500] transition font-semibold text-sm flex-shrink-0">
            <div className="relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h13M10 21a1 1 0 1 0 2 0m7 0a1 1 0 1 0 2 0" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#ff6161] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            Cart
          </button>

          {/* Orders / Login */}
          {isLoggedIn ? (
            <button onClick={() => navigate("/orders")}
              className="text-white hover:text-[#ffe500] transition font-semibold text-sm flex-shrink-0 flex items-center gap-1.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
              </svg>
              Orders
            </button>
          ) : (
            <button onClick={() => navigate("/login")}
              className="bg-white text-[#2874f0] font-bold text-xs px-4 py-2 rounded-full hover:bg-[#ffe500] hover:text-[#1a1a2e] transition flex-shrink-0">
              Sign In
            </button>
          )}
        </div>

        {/* Category Strip */}
        <div className="border-t border-blue-500/40">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto py-1.5">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap
                  ${category === cat ? "bg-[#ffe500] text-[#2874f0]" : "text-white/80 hover:text-white hover:bg-white/10"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── TOP BANNER ADS ───────────────────────────────────────────────── */}
      {topBannerAds.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mt-3 flex flex-col gap-2">
          {topBannerAds.map((ad) => (
            <div key={ad._id}
              className="relative rounded-lg overflow-hidden h-14 flex items-center px-5 cursor-pointer shadow-sm"
              style={{ background: ad.bannerImage ? "transparent" : "#1565c0" }}
              onClick={() => handleCtaClick(ad)}>
              {ad.bannerImage && <img src={ad.bannerImage} alt={ad.title} className="absolute inset-0 w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-black/30" />
              <div className="relative z-10 flex items-center justify-between w-full">
                <span className="text-white font-bold text-sm drop-shadow">
                  {ad.badgeText && <span className="bg-[#ffe500] text-[#1a1a2e] text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase mr-2">{ad.badgeText}</span>}
                  {ad.title}{ad.offerText && <span className="text-[#ffe500] ml-2">{ad.offerText}</span>}
                </span>
                {ad.ctaText && <span className="text-white/80 text-xs font-semibold border border-white/40 px-3 py-1 rounded-full flex-shrink-0">{ad.ctaText} →</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── HERO BANNER ──────────────────────────────────────────────────── */}
      {!adsLoading && <HeroBanner ads={heroAds} onCtaClick={handleCtaClick} />}

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-5">

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {category === "All" ? "All Products" : category}
              {search && <span className="text-slate-400 font-normal"> · "{search}"</span>}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{filtered.length} results found</p>
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 outline-none cursor-pointer">
            <option value="default">Relevance</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-[#2874f0] border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Loading products...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <p className="text-red-600 font-semibold mb-1">Failed to load products</p>
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button onClick={() => dispatch(fetchProducts())} className="bg-[#2874f0] text-white px-6 py-2 rounded-lg text-sm font-semibold">Retry</button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="text-6xl">🔍</div>
              <p className="text-slate-500 font-semibold text-lg">No products found</p>
              <button onClick={() => { setSearch(""); setCategory("All"); }}
                className="mt-2 bg-[#2874f0] text-white px-6 py-2 rounded-lg text-sm font-semibold">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.map((product, idx) => {
                // ── Badge priority: CRM offerLabel → auto-calculated discount ──
                const autoDiscount = calcDiscount(product.mrp, product.price);
                const badgeLabel   = product.offerLabel || (autoDiscount ? `${autoDiscount}% OFF` : null);

                const inWish     = wishlist.includes(product._id);
                const justAdded  = addedId === product._id;
                const outOfStock = product.stock === 0;
                const midAd      = idx === MID_AFTER - 1 && midBannerAds.length > 0 ? midBannerAds[0] : null;

                return (
                  <React.Fragment key={product._id}>
                    <div className="bg-white rounded-lg overflow-hidden border border-slate-100 hover:shadow-lg transition-all duration-200 group flex flex-col relative">

                      {/* ── Offer Badge (CRM offerLabel or auto discount) ── */}
                      {badgeLabel && (
                        <div className="absolute top-2 left-2 z-10 bg-[#ff6161] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm">
                          {badgeLabel}
                        </div>
                      )}

                      {/* ── Wishlist Heart Button ── */}
                      <button
                        onClick={() => toggleWishlist(product._id)}
                        title={inWish ? "Remove from wishlist" : "Add to wishlist"}
                        className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full shadow flex items-center justify-center text-sm transition-all
                          ${inWish ? "bg-red-50 scale-110" : "bg-white hover:scale-110"}`}
                      >
                        {inWish ? "❤️" : "🤍"}
                      </button>

                      {/* Image */}
                      <div className="relative h-44 bg-[#f8f9fa] overflow-hidden flex items-center justify-center">
                        {product.image
                          ? <img src={product.image} alt={product.name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
                          : <div className="text-5xl text-slate-200">📦</div>}
                        {outOfStock && (
                          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                            <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3 flex flex-col flex-1">
                        {product.category && (
                          <span className="text-[10px] text-[#2874f0] font-semibold uppercase tracking-wide mb-0.5">{product.category}</span>
                        )}
                        <h3 className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug mb-2 flex-1">{product.name}</h3>
                        <div className="flex items-baseline gap-1.5 mb-2.5">
                          <span className="text-base font-extrabold text-slate-900">₹{product.price.toLocaleString("en-IN")}</span>
                          {product.mrp && product.mrp > product.price && (
                            <span className="text-xs text-slate-400 line-through">₹{product.mrp.toLocaleString("en-IN")}</span>
                          )}
                        </div>
                        {product.price >= 499 && (
                          <p className="text-[10px] text-green-600 font-semibold mb-2">✦ Free Delivery</p>
                        )}
                        <button
                          onClick={() => !outOfStock && handleAddToCart(product)}
                          disabled={outOfStock}
                          className={`w-full py-2 rounded-md text-xs font-bold tracking-wide transition-all duration-200
                            ${outOfStock ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                              : justAdded ? "bg-green-500 text-white scale-95"
                              : "bg-[#ff9f00] hover:bg-[#f0900a] text-white active:scale-95"}`}
                        >
                          {outOfStock ? "Out of Stock" : justAdded ? "✓ Added!" : "ADD TO CART"}
                        </button>
                      </div>
                    </div>

                    {midAd && <MidBanner ad={midAd} onCtaClick={handleCtaClick} />}
                  </React.Fragment>
                );
              })}
            </div>
          )
        )}

        {/* Wishlist count hint */}
        {wishlist.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              ❤️ <strong>{wishlist.length}</strong> item{wishlist.length > 1 ? "s" : ""} in your wishlist
              {!isLoggedIn && <span className="ml-1 text-[#2874f0] font-medium cursor-pointer hover:underline" onClick={() => navigate("/login")}> — Sign in to save across devices</span>}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#172337] mt-10 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-6 text-slate-400 text-xs">
          {["100% Secure Payments 🔒", "Easy Returns 🔄", "Fast Delivery 🚚", "24/7 Support 💬"].map((item) => (
            <span key={item} className="font-medium">{item}</span>
          ))}
        </div>
        <p className="text-center text-slate-600 text-xs mt-3">© 2025 QuickShop · Powered by TeamsInfo CRM</p>
      </footer>
    </div>
  );
};

export default CustomerHome;

