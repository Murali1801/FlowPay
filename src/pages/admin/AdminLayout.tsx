import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  LayoutDashboard,
  ShoppingCart,
  Globe,
  BarChart2,
  Settings,
  HelpCircle,
  Bell,
  LogOut,
  ChevronRight,
  BookOpen,
  Zap,
  Menu,
  X,
  Search,
} from "lucide-react";
import s from "./AdminLayout.module.css";


const NAV_MAIN = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/websites", label: "Stores", icon: Globe },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart2 },
];

const NAV_SETTINGS = [
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/docs", label: "Developer Docs", icon: BookOpen },
];

export default function AdminLayout() {
  const { profile, logOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const email = profile?.email ?? "";
  const initial = email ? email[0]!.toUpperCase() : "?";

  return (
    <div className={s.shell}>
      {/* ── Topbar ─────────────────────────────────── */}
      <header className={s.topbar}>
        <button
          type="button"
          className={s.menuBtn}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link to="/" className={s.topbarBrand} onClick={() => setIsSidebarOpen(false)}>
          <div className={s.topbarBrandMark}>FP</div>
          <span className={s.topbarBrandName}>FlowPay</span>
        </Link>
         <div className={s.topbarSep} />
         
         <div className={s.topbarSearch}>
           <Search size={16} className={s.topbarSearchIcon} />
           <input 
             type="text" 
             placeholder="Jump to Order ID or UTR…" 
             onKeyDown={(e) => {
               if (e.key === 'Enter') {
                 const q = (e.target as HTMLInputElement).value;
                 if (q) window.location.href = `/admin/orders?search=${encodeURIComponent(q)}`;
               }
             }}
           />
         </div>
 
         <div className={s.topbarSpacer} />

        <div className={s.topbarActions}>
          <button type="button" className={s.iconBtn} aria-label="Help">
            <HelpCircle size={18} />
          </button>
          <button type="button" className={s.iconBtn} aria-label="Notifications">
            <Bell size={18} />
            <span className={s.notifBadge} />
          </button>

          <div className={s.userMenu}>
            <span className={s.userAvatar} aria-hidden>{initial}</span>
            <span className={s.userEmail}>{email || "—"}</span>
            <ChevronRight size={14} style={{ color: "var(--text-4)" }} />
          </div>

          <button
            type="button"
            className={s.signOutBtn}
            onClick={() => void logOut()}
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────── */}
      <div className={s.body}>
        {/* Sidebar Overlay */}
        {isSidebarOpen && (
          <div className={s.overlay} onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`${s.sidebar} ${isSidebarOpen ? s.sidebarOpen : ""}`}>
          <div className={s.sidebarSection}>
            <div className={s.sidebarSectionLabel}>Overview</div>
            <nav className={s.nav} aria-label="Main navigation">
              {NAV_MAIN.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/admin/dashboard"}
                  className={({ isActive }) =>
                    isActive ? `${s.navLink} ${s.navLinkActive}` : s.navLink
                  }
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Icon size={17} className={s.navIcon} />
                  <span className={s.navLabel}>{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className={s.sidebarDivider} />

          <div className={s.sidebarSection}>
            <div className={s.sidebarSectionLabel}>Account</div>
            <nav className={s.nav} aria-label="Account navigation">
              {NAV_SETTINGS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    isActive ? `${s.navLink} ${s.navLinkActive}` : s.navLink
                  }
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Icon size={17} className={s.navIcon} />
                  <span className={s.navLabel}>{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className={s.sidebarFooter}>
            <div className={s.sidebarFooterCard}>
              <div className={s.sidebarFooterTitle}>
                <Zap size={12} style={{ display: "inline", marginRight: 4 }} />
                Upgrade to Growth
              </div>
              <div className={s.sidebarFooterDesc}>
                Unlock analytics, unlimited stores & priority support.
              </div>
              <a href="#" className={s.sidebarFooterBtn}>View plans</a>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className={s.main}>
          <div className={s.mainInner}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
