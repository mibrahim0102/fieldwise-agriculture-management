import { useEffect, useMemo, useState } from "react";
import { Navigate, NavLink, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell, ChevronDown, ChevronLeft, ChevronRight, LogOut, Menu, Moon, Search,
  Settings2, Sprout, Sun, X, LayoutDashboard, Wheat, ShoppingCart, Users,
  ClipboardList, Wallet, Package, HardHat, CalendarCheck, Tractor, Wrench,
  History, UserRoundCog, ShieldCheck
} from "lucide-react";
import { navigationGroups, resourceDefinitions } from "./app/resources";
import { signOut } from "./app/redux/userSlice";
import { resourceApi } from "./app/redux/api/resources";
import { useRole } from "./app/hooks/useRole";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import ResourcePage from "./pages/ResourcePage";
import { ToastProvider } from "./components/Toast";

const icons = {
  LayoutDashboard, Wheat, ShoppingCart, Users, ClipboardList, Wallet, Package,
  HardHat, CalendarCheck, Tractor, Wrench, History, UserRoundCog
};

function ProtectedRoute() {
  const user = useSelector((state) => state.user.user);
  const location = useLocation();
  return user ? <Outlet /> : <Navigate to="/session/signin" replace state={{ from: location }} />;
}

function Layout() {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useRole();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const pageTitle = useMemo(() => {
    if (location.pathname === "/dashboard") return "Dashboard";
    if (location.pathname === "/profile") return "Profile & security";
    const resource = location.pathname.split("/")[1];
    return resourceDefinitions[resource]?.title || "Dashboard";
  }, [location.pathname]);

  const logout = async () => {
    await dispatch(signOut());
    navigate("/session/signin", { replace: true });
  };

  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      {sidebarOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <span className="brand-mark"><Sprout size={22} /></span>
          <span className="brand-name">fieldwise<small>FARM MANAGEMENT</small></span>
          <button className="icon-button mobile-sidebar-close" aria-label="Close navigation" onClick={() => setSidebarOpen(false)}><X size={19} /></button>
        </div>
        <div className="workspace-switch"><div className="workspace-avatar"><Sprout size={16} /></div><div className="workspace-label"><strong>Green Valley Farm</strong><span>Farm workspace</span></div><ChevronDown size={15} /></div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigationGroups.map((group) => {
            const visibleItems = group.items.filter((item) => item.key !== "users" || isAdmin);
            return visibleItems.length > 0 && <div className="nav-group" key={group.title}>
              <span className="nav-group-label">{group.title}</span>
              {visibleItems.map((item) => {
                const Icon = icons[item.icon];
                return <NavLink key={item.key} to={item.path} className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`} title={collapsed ? item.label : undefined}>
                  <Icon size={18} strokeWidth={1.8} /><span>{item.label}</span>
                </NavLink>;
              })}
            </div>;
          })}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-link" onClick={() => navigate("/profile")}><Settings2 size={18} /><span>Settings</span></button>
          <div className="sidebar-user">
            <span className="user-avatar">{user?.fullName?.slice(0, 1).toUpperCase()}</span>
            <span className="sidebar-user-info"><strong>{user?.fullName}</strong><small>{user?.role === "admin" ? "Administrator" : "Farm manager"}</small></span>
            <button className="icon-button user-logout" aria-label="Sign out" title="Sign out" onClick={logout}><LogOut size={16} /></button>
          </div>
        </div>
        <button className="collapse-control" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setCollapsed(!collapsed)}>{collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}</button>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-start">
            <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Menu size={21} /></button>
            <div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{pageTitle}</strong></div>
          </div>
          <div className="topbar-actions">
            <label className="global-search"><Search size={16} /><input placeholder="Search your farm…" aria-label="Search" onKeyDown={(event) => {
              if (event.key === "Enter" && event.currentTarget.value.trim()) navigate(`/crops?search=${encodeURIComponent(event.currentTarget.value.trim())}`);
            }} /><kbd>↵</kbd></label>
            <Notifications />
            <button className="icon-button topbar-icon theme-toggle" aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`} onClick={() => setTheme(theme === "light" ? "dark" : "light")}>{theme === "light" ? <Moon size={18} /> : <Sun size={18} />}</button>
            <button className="topbar-profile" onClick={() => navigate("/profile")} aria-label="Open profile settings">
              <span className="user-avatar top-avatar">{user?.fullName?.slice(0, 1).toUpperCase()}</span>
              <span><strong>{user?.fullName?.split(" ")[0]}</strong><small className={`role-pill role-${user?.role}`}>{user?.role}</small></span><ChevronDown size={14} />
            </button>
          </div>
        </header>
        <main className="main-content"><Outlet /></main>
        <footer className="app-footer"><span>Fieldwise <span className="footer-dot">·</span> Thoughtfully growing together</span><span><ShieldCheck size={14} /> Your farm data stays yours</span></footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/session/signin" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage signup />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            {Object.keys(resourceDefinitions).map((resource) => (
              <Route
                key={resource}
                path={`/${resource}`}
                element={resource === "users"
                  ? <AdminOnly><ResourcePage resource={resource} /></AdminOnly>
                  : <ResourcePage resource={resource} />}
              />
            ))}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
      </Routes>
    </ToastProvider>
  );
}

function Notifications() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [alerts, setAlerts] = useState(null);

  const loadAlerts = async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const [inventory, crops, equipment] = await Promise.all([
        resourceApi.list("inventory"), resourceApi.list("crops"), resourceApi.list("equipment")
      ]);
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const dueSoon = (date) => {
        const parsed = date ? new Date(`${date}T00:00:00`) : null;
        return parsed && parsed >= start && (parsed - start) / 86400000 <= 7;
      };
      setAlerts([
        { label: "Inventory below minimum", count: inventory.filter((item) => Number(item.qty) <= Number(item.minQty)).length, path: "/inventory" },
        { label: "Crops nearing harvest", count: crops.filter((crop) => dueSoon(crop.cuttingDate)).length, path: "/crops" },
        { label: "Equipment service due", count: equipment.filter((item) => {
          if (!item.lastServiceDate || !item.serviceIntervalDays) return false;
          const due = new Date(`${item.lastServiceDate}T00:00:00`);
          due.setDate(due.getDate() + Number(item.serviceIntervalDays));
          return (due - start) / 86400000 <= 7;
        }).length, path: "/equipment" }
      ].filter((alert) => alert.count > 0));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Alerts could not be loaded. Try again.");
    } finally {
      setLoading(false);
    }
  };
  const toggle = () => {
    if (open) return setOpen(false);
    setOpen(true);
    if (!alerts) loadAlerts();
  };
  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <div className="notification-wrap">
      <button className="icon-button topbar-icon" aria-label="Notifications" title="Farm notifications" aria-expanded={open} onClick={toggle}>
        <Bell size={19} />{alerts?.length > 0 && <i className="notification-dot" />}
      </button>
      {open && <div className="notification-panel">
        <div className="notification-heading"><strong>Farm alerts</strong><span>Last 7 days</span></div>
        {loading ? <p className="notification-message">Checking your farm…</p>
          : error ? <div className="notification-message notification-error"><span>{error}</span><button onClick={loadAlerts}>Retry</button></div>
            : alerts?.length ? alerts.map((alert) => <button className="notification-item" key={alert.path} onClick={() => { setOpen(false); navigate(alert.path); }}><span><strong>{alert.label}</strong><small>Review this area to keep things on track.</small></span><b>{alert.count}</b></button>)
              : <p className="notification-message">You’re all caught up. No farm alerts right now.</p>}
      </div>}
    </div>
  );
}

function AdminOnly({ children }) {
  const { isAdmin } = useRole();
  return isAdmin ? children : <Navigate to="/dashboard" replace />;
}
