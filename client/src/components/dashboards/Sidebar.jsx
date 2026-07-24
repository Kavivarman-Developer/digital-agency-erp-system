import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, FolderOpen, Package, ShoppingCart, FileCode2,
  Search, Bell, Settings, LogOut, Zap, ChevronRight,
  Sun, Moon, Menu, X, LayoutDashboard, Briefcase, ShieldAlert,
  Megaphone, TrendingUp, // ✅ TrendingUp - Customer Insights icon
} from "lucide-react";
import { logout } from "../../utils/auth";
import { selectAllOrders, fetchOrders } from "../../features/orderSlice";
import { selectAllProducts } from "../../features/productSlice";

/* ─── Menu builder ───────────────────────────────────────────── */
const buildMenu = (newOrderCount) => [
  {
    section: "CRM",
    icon: LayoutDashboard,
    badge: null,
    items: [
      { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
      { label: "Clients",   path: "/clients",   icon: Users },
      { label: "Customers", path: "/customers", icon: Users },
      { label: "Customer Insights", path: "/admin/customer-insights", icon: TrendingUp }, // 🆕 NEW
    ],
  },
  {
    section: "Project Management",
    icon: Briefcase,
    badge: null,
    items: [{ label: "Projects", path: "/projects", icon: FolderOpen }],
  },
  {
    section: "Store & Sales",
    icon: ShoppingCart,
    badge: newOrderCount || null,
    items: [
      { label: "Products",       path: "/products",       icon: Package },
      { label: "Orders",         path: "/orders",         icon: ShoppingCart, badge: newOrderCount || null },
      { label: "Templates",      path: "/templates",      icon: FileCode2 },
      { label: "Advertisements", path: "/advertisements", icon: Megaphone },
    ],
  },
  {
    section: "HR Management",
    icon: Users,
    badge: null,
    items: [
      { label: "Leaves", path: "/leaves", icon: Package },
      { label: "Tasks",  path: "/tasks",  icon: FolderOpen },
    ],
  },
  {
    section: "System",
    icon: ShieldAlert,
    badge: null,
    items: [
      { label: "Settings", path: "/settings", icon: Settings },
    ]
  },
];

/* ─── Theme helpers ──────────────────────────────────────────── */
const tw = {
  sidebar: (t) =>
    `h-screen flex flex-col overflow-hidden border-r select-none transition-colors duration-300 font-sans
     ${t === "dark" ? "bg-[#0B0F19] border-slate-900" : t === "orange" ? "bg-orange-50 border-orange-100" : "bg-white border-slate-100"}`,
  sectionBtn: (open, t) =>
    `w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors duration-150 group
     ${open ? t === "dark" ? "bg-slate-800" : t === "orange" ? "bg-orange-100" : "bg-slate-50 shadow-sm"
      : t === "dark" ? "hover:bg-slate-800/60" : t === "orange" ? "hover:bg-orange-50" : "hover:bg-slate-50"}`,
  sectionIcon: (open, t) =>
    `w-7 h-7 rounded-lg flex items-center justify-center transition-colors
     ${open ? t === "orange" ? "bg-orange-500 text-white" : "bg-blue-600 text-white"
      : t === "dark" ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-500"}`,
  subItem: (active, t) =>
    `w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150
     ${active ? t === "orange" ? "bg-orange-100 text-orange-700" : t === "dark" ? "bg-blue-900/40 text-blue-400" : "bg-blue-50 text-blue-700"
      : t === "dark" ? "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
        : t === "orange" ? "text-stone-600 hover:bg-orange-50" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`,
  subIcon: (active, t) =>
    `w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors
     ${active ? t === "orange" ? "bg-orange-500 text-white" : "bg-blue-600 text-white"
      : t === "dark" ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-400"}`,
  footer: (t) =>
    `flex-shrink-0 border-t px-3 py-3 transition-colors duration-200
     ${t === "dark" ? "border-slate-900 bg-[#0B0F19]" : t === "orange" ? "border-orange-100 bg-orange-50" : "border-slate-100 bg-white"}`,
  iconBtn: (t) =>
    `p-1.5 rounded-lg transition-colors
     ${t === "dark" ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"}`,
  themeBtn: (active, t) =>
    `p-1.5 rounded-lg transition-colors
     ${active ? t === "dark" ? "bg-slate-700 text-slate-200" : t === "orange" ? "bg-orange-200 text-orange-700" : "bg-slate-100 text-slate-700"
      : t === "dark" ? "text-slate-500 hover:bg-slate-800" : "text-slate-400 hover:bg-slate-100"}`,
};

/* ─── Component ──────────────────────────────────────────────── */
export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const orders = useSelector(selectAllOrders);

  // 🔧 BUG 2 FIX: Redux auth state-la irundhu role/email edukkanum, localStorage direct-a illa
  const authState = useSelector((state) => state.auth);
  const role = authState?.role || localStorage.getItem("role") || "admin";
  const email = authState?.email || localStorage.getItem("email") || "";
  const userName = email ? email.split("@")[0] : "user";

  const [lastSeenAt, setLastSeenAt] = useState(
    () => Number(localStorage.getItem("ordersLastSeen") || 0)
  );

  useEffect(() => {
    if (location.pathname === "/orders") {
      const now = Date.now();
      localStorage.setItem("ordersLastSeen", String(now));
      setLastSeenAt(now);
    }
  }, [location.pathname]);

  // 🔧 BUG 3 FIX: useMemo vechi unnecessary recalculation avoid pannuthu
  const newOrderCount = useMemo(() => {
    return orders.filter((o) => {
      const createdTime = new Date(o.createdAt).getTime();
      return createdTime > lastSeenAt;
    }).length;
  }, [orders, lastSeenAt]);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const ADMIN_MENU = useMemo(() => buildMenu(newOrderCount), [newOrderCount]);

  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") ||
      (document.documentElement.classList.contains("dark") ? "dark" : "light")
  );
  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "true"
  );

  // 🔧 BUG 1 FIX: current route padi correct section active-a irukanum
  const getSectionForPath = (path) =>
    ADMIN_MENU.find((sec) => sec.items.some((i) => i.path === path))?.section || "CRM";

  const [openSection, setOpenSection] = useState(() => getSectionForPath(location.pathname));

  // Route maarumbodhu (navigation or refresh), correct section auto-open aaganum
  useEffect(() => {
    setOpenSection(getSectionForPath(location.pathname));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    try { localStorage.setItem("theme", theme); } catch (_) {}
    const root = document.documentElement;
    if (theme === "dark")        { root.classList.add("dark"); root.removeAttribute("data-theme"); }
    else if (theme === "orange") { root.classList.remove("dark"); root.setAttribute("data-theme", "orange"); }
    else                         { root.classList.remove("dark"); root.removeAttribute("data-theme"); }
  }, [theme]);

  useEffect(() => {
    try { localStorage.setItem("sidebarCollapsed", String(isCollapsed)); } catch (_) {}
  }, [isCollapsed]);

  const filteredMenu = ADMIN_MENU.map((sec) => ({
    ...sec,
    filteredItems: sec.items.filter((i) =>
      i.label.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((sec) => !search || sec.filteredItems.length > 0);

  const toggleSection = (name) =>
    setOpenSection((prev) => (prev === name ? null : name));

  /* ── Collapsed icon rail ── */
  const CollapsedRail = () => (
    <div className="flex flex-col items-center gap-1 px-2 py-2 flex-1 overflow-y-auto">
      {ADMIN_MENU.map((sec) => {
        const Icon     = sec.icon;
        const isActive = sec.items.some((i) => i.path === location.pathname);
        return (
          <button
            key={sec.section}
            title={sec.section}
            aria-label={sec.section}
            onClick={() => sec.items[0] && navigate(sec.items[0].path)}
            className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-colors
              ${isActive
                ? theme === "orange" ? "bg-orange-500 text-white" : "bg-blue-600 text-white"
                : theme === "dark"   ? "text-slate-400 hover:bg-slate-800"   : "text-slate-400 hover:bg-slate-100"}`}
          >
            <Icon size={18} strokeWidth={2} />
            {sec.badge > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1
                               rounded-full bg-red-500 text-white text-[9px] font-bold
                               flex items-center justify-center">
                {sec.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  /* ── Full sidebar nav ── */
  const FullNav = () => (
    <>
      <div className="px-4 pb-1">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest
                          ${theme === "dark" ? "bg-blue-950/40 text-blue-400" : theme === "orange" ? "bg-orange-100 text-orange-700" : "bg-blue-50 text-blue-700"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${theme === "orange" ? "bg-orange-500" : "bg-blue-500"}`} />
          {role}
        </span>
      </div>

      <div className="px-3 pb-2">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border
                         ${theme === "dark" ? "bg-slate-800/60 border-slate-700" : theme === "orange" ? "bg-white border-orange-200" : "bg-slate-50 border-slate-200"}`}>
          <Search size={14} className="text-slate-400 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu…"
            className="flex-1 bg-transparent text-[13px] outline-none placeholder-slate-400 text-slate-700 dark:text-slate-200"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 space-y-0.5
                      scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        {filteredMenu.map((sec) => {
          const Icon     = sec.icon;
          const hasItems = sec.filteredItems.length > 0;
          const isOpen   = openSection === sec.section || (!!search && hasItems);

          return (
            <div key={sec.section}>
              <button
                onClick={() => hasItems && !search && toggleSection(sec.section)}
                aria-expanded={isOpen}
                className={tw.sectionBtn(isOpen && hasItems, theme)}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={tw.sectionIcon(isOpen && hasItems, theme)}>
                    <Icon size={15} strokeWidth={2} />
                  </span>
                  <span className={`text-[13px] font-semibold truncate
                    ${theme === "dark"   ? isOpen ? "text-slate-100" : "text-slate-300"
                      : theme === "orange" ? isOpen ? "text-orange-900" : "text-stone-700"
                        : isOpen ? "text-slate-800" : "text-slate-600"}`}>
                    {sec.section}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {sec.badge > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {sec.badge}
                    </span>
                  )}
                  {hasItems && !search && (
                    <ChevronRight size={14} className={`transition-transform duration-200 text-slate-400 ${isOpen ? "rotate-90" : ""}`} />
                  )}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {hasItems && isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pl-4 pr-1 py-0.5 space-y-0.5">
                      {sec.filteredItems.map((item) => {
                        const SubIcon  = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                          <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={tw.subItem(isActive, theme)}
                          >
                            <span className={tw.subIcon(isActive, theme)}>
                              <SubIcon size={13} strokeWidth={2} />
                            </span>
                            <span className="flex-1 text-left capitalize">{item.label}</span>
                            {item.badge > 0 && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md
                                ${theme === "orange" ? "bg-orange-100 text-orange-700" : "bg-red-500 text-white"}`}>
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>
    </>
  );

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 68 : 260 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className={tw.sidebar(theme)}
    >
      <div className={`flex items-center justify-between px-3 py-4 flex-shrink-0 ${isCollapsed ? "flex-col gap-2" : ""}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`relative w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${theme === "orange" ? "bg-orange-500" : "bg-blue-600"}`}>
              <Zap size={16} className="text-white fill-white" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-[#0B0F19]" />
            </div>
            <div className="min-w-0">
              <p className={`text-[13px] font-bold leading-tight truncate ${theme === "dark" ? "text-slate-100" : "text-slate-800"}`}>Digital Agency</p>
              <p className="text-[10px] text-slate-400">ERP System</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${theme === "orange" ? "bg-orange-500" : "bg-blue-600"}`}>
            <Zap size={16} className="text-white fill-white" />
          </div>
        )}
        <button
          onClick={() => setIsCollapsed((p) => !p)}
          aria-label="Toggle sidebar"
          className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${theme === "dark" ? "text-slate-400 hover:bg-slate-800" : "text-slate-400 hover:bg-slate-100"}`}
        >
          {isCollapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
      </div>

      {isCollapsed ? <CollapsedRail /> : <FullNav />}

      <div className={tw.footer(theme)}>
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <button className={tw.iconBtn(theme)} aria-label="Notifications">
              <div className="relative"><Bell size={16} /><span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500" /></div>
            </button>
            <button className={tw.iconBtn(theme)} aria-label="Settings"><Settings size={16} /></button>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-bold uppercase ${theme === "orange" ? "bg-orange-500" : "bg-blue-600"}`}>
              {userName[0]}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-0.5">
                <button className={`${tw.iconBtn(theme)} relative`} aria-label="Notifications">
                  <Bell size={16} /><span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
                </button>
                <button className={tw.iconBtn(theme)} aria-label="Settings"><Settings size={16} /></button>
              </div>
              <div className="flex items-center gap-0.5">
                <button onClick={() => setTheme("light")}  className={tw.themeBtn(theme === "light",  theme)}><Sun size={14} /></button>
                <button onClick={() => setTheme("dark")}   className={tw.themeBtn(theme === "dark",   theme)}><Moon size={14} /></button>
                <button onClick={() => setTheme("orange")} className={tw.themeBtn(theme === "orange", theme)}>
                  <span className="w-2.5 h-2.5 rounded-full block bg-orange-400" />
                </button>
                <button onClick={logout} className="p-1.5 rounded-lg transition-colors ml-0.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <LogOut size={14} />
                </button>
              </div>
            </div>
            <div className={`flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-colors
                              ${theme === "dark" ? "hover:bg-slate-800" : theme === "orange" ? "hover:bg-orange-100" : "hover:bg-slate-50"}`}>
              <div className="relative flex-shrink-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-[12px] font-bold uppercase ${theme === "orange" ? "bg-orange-500" : "bg-blue-600"}`}>
                  {userName[0]}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-[#0B0F19]" />
              </div>
              <div className="min-w-0">
                <p className={`text-[13px] font-semibold capitalize truncate leading-tight ${theme === "dark" ? "text-slate-200" : "text-slate-700"}`}>{userName}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{role}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.aside>
  );
}