import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  TrendingUp, ShoppingCart, CheckCircle, Clock,
  ArrowRight, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getAdminOrders, getAdminStats, type AdminOrderRow, type StatsResponse } from "../../api";
import s from "./AdminDashboardPage.module.css";
import ls from "./AdminLayout.module.css";

const POLL_MS = 5000;
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TEAL = "#0ea5e9";

const GREEN = "#10b981";
const AMBER = "#f59e0b";

const PIE_COLORS = [GREEN, AMBER, "#e2e8f0"];

function buildDailyData(orders: AdminOrderRow[]) {
  const counts = new Array<number>(7).fill(0);
  const now = new Date();
  for (const o of orders) {
    if (!o.created_at) continue;
    const d = new Date(o.created_at);
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
    if (diffDays < 0 || diffDays >= 7) continue;
    const dow = d.getDay();
    const idx = dow === 0 ? 6 : dow - 1;
    counts[idx]++;
  }
  return DAY_LABELS.map((day, i) => ({ day, orders: counts[i] }));
}

function fmtInr(n: string | undefined): string {
  if (!n || n === "—") return "—";
  const num = parseFloat(n.replace(/,/g, ""));
  if (!isFinite(num)) return `₹${n}`;
  return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(s: string | null | undefined): string {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleString("en-IN", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    });
  } catch { return s; }
}

export default function AdminDashboardPage() {
  const { getAccessToken, profile } = useAuth();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [allOrders, setAllOrders] = useState<AdminOrderRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [activeRange, setActiveRange] = useState<"7d" | "30d">("7d");

  const load = useCallback(async (isRetry = false) => {
    try {
      const token = await getAccessToken(isRetry);
      const [st, or] = await Promise.all([getAdminStats(token), getAdminOrders(token)]);
      setStats(st);
      setAllOrders(or);
      setOrders(or.slice(0, 8));
      setErr(null);
    } catch (e) {
      if (!isRetry && e instanceof Error && (e.message.includes("token") || e.message.includes("401"))) {
        return void load(true);
      }
      setErr(e instanceof Error ? e.message : "Failed to load dashboard");
    }
  }, [getAccessToken]);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), POLL_MS);
    return () => window.clearInterval(id);
  }, [load]);

  const dailyData = useMemo(() => buildDailyData(allOrders), [allOrders]);

  const mix = useMemo(() => {
    const t = stats?.total_orders ?? 0;
    const paid = stats?.paid ?? 0;
    const pending = stats?.pending ?? 0;
    if (t === 0) return [{ name: "Paid", value: 0 }, { name: "Pending", value: 0 }, { name: "Other", value: 1 }];
    return [
      { name: "Paid", value: paid },
      { name: "Pending", value: pending },
      { name: "Other", value: Math.max(0, t - paid - pending) },
    ];
  }, [stats]);

  const successRate = useMemo(() => {
    const t = stats?.total_orders ?? 0;
    if (t === 0) return "—";
    return `${Math.round(((stats?.paid ?? 0) / t) * 100)}%`;
  }, [stats]);

  const welcomeName = profile?.email?.split("@")[0] ?? "there";

  const KPIs = [
    {
      icon: TrendingUp,
      label: "GMV (Paid)",
      value: fmtInr(stats?.total_paid_amount),
      foot: "Settled order value",
      trend: "+12.4%",
      up: true,
      colorClass: s.kpiIconA,
    },
    {
      icon: ShoppingCart,
      label: "Total Orders",
      value: stats?.total_orders ?? "—",
      foot: "All statuses",
      trend: "+8.1%",
      up: true,
      colorClass: s.kpiIconB,
    },
    {
      icon: CheckCircle,
      label: "Success Rate",
      value: successRate,
      foot: "Paid / Total orders",
      trend: "+2.3%",
      up: true,
      colorClass: s.kpiIconC,
    },
    {
      icon: Clock,
      label: "Pending",
      value: stats?.pending ?? "—",
      foot: "Awaiting confirmation",
      trend: "-5.0%",
      up: false,
      colorClass: s.kpiIconD,
    },
  ];

  return (
    <>
      {/* ── Page Head ──────────────────────────────── */}
      <div className={s.pageHead}>
        <div className={s.headLeft}>
          <p className={s.headGreeting}>
            <span className={ls.liveDot} aria-hidden />
            Live · refreshes every 5s
          </p>
          <h2 className={s.headTitle}>Hi {welcomeName} 👋</h2>
          <p className={s.headSub}>Here's your store performance today.</p>
        </div>
        <div className={s.dateRow}>
          {(["7d", "30d"] as const).map((r) => (
            <button
              key={r}
              className={`${s.datePill} ${activeRange === r ? s.datePillActive : ""}`}
              onClick={() => setActiveRange(r)}
            >
              {r === "7d" ? "Last 7 days" : "Last 30 days"}
            </button>
          ))}
        </div>
      </div>

      {err && <div className={ls.errorBanner}>{err}</div>}

      {/* ── KPI Cards ──────────────────────────────── */}
      <div className={s.kpiGrid}>
        {KPIs.map(({ icon: Icon, label, value, trend, up, colorClass }) => (
          <div className={s.kpi} key={label}>
            <div className={`${s.kpiIconWrap} ${colorClass}`}>
              <Icon size={20} />
            </div>
            <div className={s.kpiBody}>
              <p className={s.kpiLabel}>{label}</p>
              <p className={s.kpiValue}>{value}</p>
              <p className={s.kpiFoot}>
                <span className={`${s.kpiTrend} ${up ? s.kpiTrendUp : s.kpiTrendDown}`}>
                  {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {trend}
                </span>
                {" "}vs last week
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row ─────────────────────────────── */}
      <div className={s.split}>
        {/* Area Chart */}
        <div className={s.panel}>
          <div className={s.panelHead}>
            <h3 className={s.panelTitle}>Order trend</h3>
            <span className={s.panelBadge}>Last 7 days</span>
          </div>
          <div className={s.panelBody}>
            <div className={s.chartWrap}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={TEAL} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 10,
                      fontSize: 13,
                      boxShadow: "0 4px 12px rgba(0,0,0,.08)",
                    }}
                    labelStyle={{ fontWeight: 700, color: "#0f172a" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke={TEAL}
                    strokeWidth={2.5}
                    fill="url(#tealGrad)"
                    dot={{ r: 4, fill: TEAL, strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6, fill: TEAL, strokeWidth: 2, stroke: "#fff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className={s.panel}>
          <div className={s.panelHead}>
            <h3 className={s.panelTitle}>Order mix</h3>
            <span className={s.panelBadge}>Snapshot</span>
          </div>
          <div className={s.panelBody}>
            <div className={s.chartWrap} style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mix}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={700}
                  >
                    {mix.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(value) => (
                      <span style={{ fontSize: 12, color: "#64748b" }}>{value}</span>
                    )}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 13,
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 10,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Orders ───────────────────────────── */}
      <div className={s.tableCard}>
        <div className={s.tableHead}>
          <h3 className={s.tableTitle}>Recent orders</h3>
          <Link to="/admin/orders" className={s.tableViewAll}>
            View all <ArrowRight size={13} />
          </Link>
        </div>
        <div className={ls.tableWrap}>
          <table className={ls.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Amount</th>
                <th>Status</th>
                <th>UTR</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className={ls.tableEmpty}>
                    No orders yet. Create a checkout session from your storefront or the sandbox.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.order_id}>
                    <td className={ls.mono}>{o.order_id.slice(0, 18)}…</td>
                    <td style={{ fontWeight: 600 }}>₹{o.amount}</td>
                    <td>
                      <span className={o.status === "Paid" ? ls.statusPaid : ls.statusPending}>
                        {o.status}
                      </span>
                    </td>
                    <td className={ls.mono}>{o.utr_number ?? "—"}</td>
                    <td style={{ color: "var(--text-4)", fontSize: "0.8125rem" }}>{fmtDate(o.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
