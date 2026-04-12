import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getAdminOrders, getAdminStats, type AdminOrderRow, type StatsResponse } from "../../api";
import ls from "./AdminLayout.module.css";

const TEAL = "#0ea5e9";
const GREEN = "#10b981";
const AMBER = "#f59e0b";
const INDIGO = "#6366f1";


function buildDailyRows(orders: AdminOrderRow[], days = 7) {
  const rows: { day: string; orders: number; revenue: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-IN", { weekday: "short" });
    const dayOrders = orders.filter(o => {
      if (!o.created_at) return false;
      const od = new Date(o.created_at);
      return od.toDateString() === d.toDateString();
    });
    rows.push({
      day: label,
      orders: dayOrders.length,
      revenue: dayOrders
        .filter(o => o.status === "Paid")
        .reduce((sum, o) => sum + parseFloat(o.amount || "0"), 0),
    });
  }
  return rows;
}

function buildHourly(orders: AdminOrderRow[]) {
  const counts = new Array<number>(24).fill(0);
  orders.forEach(o => {
    if (!o.created_at) return;
    const h = new Date(o.created_at).getHours();
    counts[h]++;
  });
  return counts.map((c, h) => ({ hour: `${h}:00`, orders: c }));
}

function fmtInr(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const StatCard = ({
  icon: Icon, label, value, sub, color, up,
}: { icon: React.ElementType; label: string; value: string; sub: string; color: string; up?: boolean }) => (
  <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 20, display: "flex", alignItems: "flex-start", gap: 14, boxShadow: "var(--shadow-sm)", transition: "all 0.18s", cursor: "default" }}>
    <div style={{ width: 42, height: 42, borderRadius: "var(--radius)", background: `${color}15`, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon size={20} />
    </div>
    <div>
      <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-4)", marginBottom: 5 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-brand)", fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", lineHeight: 1, marginBottom: 5 }}>{value}</div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-4)", display: "flex", alignItems: "center", gap: 3 }}>
        {up !== undefined && (up ? <TrendingUp size={12} color={GREEN} /> : <TrendingDown size={12} color={AMBER} />)}
        {sub}
      </div>
    </div>
  </div>
);

const Panel = ({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) => (
  <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border-light)" }}>
      <h3 style={{ fontFamily: "var(--font-brand)", fontSize: "0.9375rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>{title}</h3>
      {badge && <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-4)", background: "var(--bg-alt)", border: "1px solid var(--border)", padding: "3px 10px", borderRadius: "var(--radius-full)" }}>{badge}</span>}
    </div>
    <div style={{ padding: 20 }}>{children}</div>
  </div>
);

export default function AdminAnalyticsPage() {
  const { getAccessToken } = useAuth();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [range, setRange] = useState<7 | 30>(7);

  const load = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const [st, or] = await Promise.all([getAdminStats(token), getAdminOrders(token)]);
      setStats(st); setOrders(or); setErr(null);
    } catch (e) { setErr(e instanceof Error ? e.message : "Failed to load analytics"); }
  }, [getAccessToken]);

  useEffect(() => { void load(); }, [load]);

  const dailyData = useMemo(() => buildDailyRows(orders, range), [orders, range]);
  const hourlyData = useMemo(() => buildHourly(orders), [orders]);

  const totalRevenue = useMemo(() =>
    orders.filter(o => o.status === "Paid").reduce((s, o) => s + parseFloat(o.amount || "0"), 0),
  [orders]);

  const avgOrderValue = useMemo(() => {
    const paid = orders.filter(o => o.status === "Paid");
    if (!paid.length) return 0;
    return totalRevenue / paid.length;
  }, [orders, totalRevenue]);

  const convRate = useMemo(() => {
    if (!stats?.total_orders) return "0%";
    return `${Math.round(((stats.paid ?? 0) / stats.total_orders) * 100)}%`;
  }, [stats]);

  const mixData = useMemo(() => [
    { name: "Paid", value: stats?.paid ?? 0 },
    { name: "Pending", value: stats?.pending ?? 0 },
    { name: "Other", value: Math.max(0, (stats?.total_orders ?? 0) - (stats?.paid ?? 0) - (stats?.pending ?? 0)) },
  ], [stats]);

  return (
    <>
      {/* ── Page Head ───────────────────────── */}
      <div className={ls.pageHeaderSplit}>
        <div>
          <h2 className={ls.pageTitle}>Analytics</h2>
          <p className={ls.pageSub}>Payment & conversion insights</p>
        </div>
        <div className={ls.filterRow}>
          <div className={ls.pillGroup}>
            {([7, 30] as const).map(r => (
              <button key={r} onClick={() => setRange(r)} className={`${ls.filterPill} ${range === r ? ls.filterPillActive : ""}`}>
                {r}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {err && <div className={ls.errorBanner}>{err}</div>}

      {/* KPI row */}
      <div className={ls.kpiGrid}>
        <StatCard icon={TrendingUp} label="Total GMV" value={fmtInr(totalRevenue)} sub="Paid orders only" color={TEAL} up />
        <StatCard icon={Target} label="Conversion Rate" value={convRate} sub="Paid / Total" color={GREEN} up />
        <StatCard icon={Activity} label="Avg Order Value" value={fmtInr(avgOrderValue)} sub="Per paid order" color={INDIGO} up />
        <StatCard icon={Activity} label="Total Orders" value={String(stats?.total_orders ?? "—")} sub="All statuses" color={AMBER} />
      </div>

      {/* Charts split */}
      <div className={ls.gridSplit}>
        <Panel title="Revenue Trend" badge={`Last ${range} days`}>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={TEAL} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${v/1000}k` : v} />
                <Tooltip
                  formatter={(v) => [fmtInr(Number(v ?? 0)), "Revenue"]}
                  contentStyle={{ fontSize: 13, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, boxShadow: "var(--shadow-lg)" }}
                />
                <Area type="monotone" dataKey="revenue" stroke={TEAL} strokeWidth={3} fill="url(#revGrad)" dot={{ r: 4, fill: TEAL, stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 6, fill: TEAL, stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Order Mix" badge="Paid vs Pending">
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={mixData} cx="50%" cy="45%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value" animationDuration={700}>
                  {mixData.map((_, i) => (
                    <Cell key={i} fill={[GREEN, AMBER, "#f1f5f9"][i]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10 }} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* Secondary charts */}
      <div className={ls.gridSplitEqual}>
        <Panel title="Daily Orders" badge={`Last ${range} days`}>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: "var(--fp-teal-soft)" }} contentStyle={{ borderRadius: 10 }} />
                <Bar dataKey="orders" fill={INDIGO} radius={[5, 5, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Hourly Activity" badge="Today">
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval={window.innerWidth < 640 ? 5 : 2} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: "var(--fp-teal-soft)" }} contentStyle={{ borderRadius: 10 }} />
                <Bar dataKey="orders" fill={TEAL} radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </>
  );
}
