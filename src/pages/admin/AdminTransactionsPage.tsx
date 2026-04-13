import { useCallback, useEffect, useState } from "react";
import {
  Search, Filter, Copy, Check, ChevronDown,
  ChevronUp, RefreshCw, FileText,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getAdminOrders, type AdminOrderRow } from "../../api";
import ls from "./AdminLayout.module.css";

type SortKey = "created_at" | "amount" | "status";
type SortDir = "asc" | "desc";

function fmtDate(s: string | null | undefined): string {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return s; }
}

const PAGE_SIZE = 20;

export default function AdminTransactionsPage() {
  const { getAccessToken } = useAuth();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState<"All" | "Paid" | "Pending">("All");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);
  const [printingOrder, setPrintingOrder] = useState<AdminOrderRow | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [printingBatch, setPrintingBatch] = useState<AdminOrderRow[]>([]);

  useEffect(() => {
    if (printingOrder || printingBatch.length > 0) {
      window.print();
      setPrintingOrder(null);
      setPrintingBatch([]);
    }
  }, [printingOrder, printingBatch]);

  const load = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const data = await getAdminOrders(token);
      setOrders(data);
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(id);
  }, [load]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const filtered = orders
    .filter(o => {
      const q = search.toLowerCase();
      const matchQ = !q || o.order_id.includes(q) || (o.utr_number ?? "").includes(q) || (o.merchant_id ?? "").includes(q);
      const matchS = statusFilter === "All" || o.status === statusFilter;
      return matchQ && matchS;
    })
    .sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";
      if (sortKey === "amount") { av = parseFloat(a.amount); bv = parseFloat(b.amount); }
      else if (sortKey === "status") { av = a.status; bv = b.status; }
      else { av = a.created_at ?? ""; bv = b.created_at ?? ""; }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageOrders = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const copyText = (text: string, id: string) => {
    void navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const SortIcon = ({ k }: { k: SortKey }) => (
    sortKey === k
      ? sortDir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
      : <ChevronDown size={13} style={{ opacity: 0.3 }} />
  );

  return (
    <>
      {/* ── Page Head ───────────────────────── */}
      <div className={ls.pageHeaderSplit}>
        <div>
          <h2 className={ls.pageTitle}>Orders</h2>
          <p className={ls.pageSub}>
            {filtered.length} order{filtered.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {selectedIds.size > 0 && (
            <button
              onClick={() => {
                const batch = orders.filter(o => selectedIds.has(o.order_id));
                setPrintingBatch(batch);
              }}
              className={ls.batchBtn}
            >
              Print Selected ({selectedIds.size})
            </button>
          )}
          <button
            onClick={() => void load()}
            className={ls.refreshBtn}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {err && <div className={ls.errorBanner}>{err}</div>}

      {/* ── Filters ─────────────────────────── */}
      <div className={ls.filterRow}>
        <div className={ls.searchWrap}>
          <Search size={15} className={ls.searchIcon} />
          <input
            type="text"
            placeholder="Search by ID, UTR, merchant…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className={ls.searchInput}
          />
        </div>
        <div className={ls.statusFilterRow}>
          <Filter size={14} style={{ color: "var(--text-4)", flexShrink: 0 }} />
          <div className={ls.pillGroup}>
            {(["All", "Paid", "Pending"] as const).map(s => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`${ls.filterPill} ${statusFilter === s ? ls.filterPillActive : ""}`}
              >{s}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table ──────────────────────────── */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
        <div className={ls.tableWrap}>
          <table className={ls.table}>
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    checked={pageOrders.length > 0 && pageOrders.every(o => selectedIds.has(o.order_id))}
                    onChange={e => {
                      const newSet = new Set(selectedIds);
                      if (e.target.checked) pageOrders.forEach(o => newSet.add(o.order_id));
                      else pageOrders.forEach(o => newSet.delete(o.order_id));
                      setSelectedIds(newSet);
                    }}
                  />
                </th>
                <th>Order ID</th>
                <th style={{ cursor: "pointer", userSelect: "none" }} onClick={() => handleSort("amount")}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>Amount <SortIcon k="amount" /></span>
                </th>
                <th style={{ cursor: "pointer", userSelect: "none" }} onClick={() => handleSort("status")}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>Status <SortIcon k="status" /></span>
                </th>
                <th>UTR Number</th>
                <th>Merchant</th>
                <th style={{ cursor: "pointer", userSelect: "none" }} onClick={() => handleSort("created_at")}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>Created <SortIcon k="created_at" /></span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--text-4)" }}>Loading orders…</td></tr>
              ) : pageOrders.length === 0 ? (
                <tr><td colSpan={6} className={ls.tableEmpty}>No orders match your filter.</td></tr>
              ) : (
                pageOrders.map((o) => (
                  <tr key={o.order_id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(o.order_id)}
                        onChange={e => {
                          const newSet = new Set(selectedIds);
                          if (e.target.checked) newSet.add(o.order_id);
                          else newSet.delete(o.order_id);
                          setSelectedIds(newSet);
                        }}
                      />
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className={ls.mono}>{o.order_id.slice(0, 16)}…</span>
                        <button
                          onClick={() => copyText(o.order_id, `oid-${o.order_id}`)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: copied === `oid-${o.order_id}` ? "var(--fp-green)" : "var(--text-4)", padding: 2, display: "flex", alignItems: "center" }}
                          title="Copy order ID"
                        >
                          {copied === `oid-${o.order_id}` ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{o.amount}</td>
                    <td>
                      <span className={o.status === "Paid" ? ls.statusPaid : ls.statusPending}>
                        {o.status}
                      </span>
                    </td>
                    <td>
                      {o.utr_number ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span className={ls.mono}>{o.utr_number}</span>
                          <button
                            onClick={() => copyText(o.utr_number!, `utr-${o.order_id}`)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: copied === `utr-${o.order_id}` ? "var(--fp-green)" : "var(--text-4)", padding: 2, display: "flex", alignItems: "center" }}
                          >
                            {copied === `utr-${o.order_id}` ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                      ) : <span style={{ color: "var(--text-4)" }}>—</span>}
                    </td>
                    <td className={ls.mono}>{o.merchant_id ? o.merchant_id.slice(0, 12) + "…" : "—"}</td>
                    <td style={{ color: "var(--text-4)", fontSize: "0.8125rem" }}>{fmtDate(o.created_at)}</td>
                    <td>
                      <button
                        onClick={() => setPrintingOrder(o)}
                        className={ls.tableActionBtn}
                        title="Print Receipt"
                      >
                        <FileText size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid var(--border-light)" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-4)" }}>
              Page {page} of {totalPages} · {filtered.length} results
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ padding: "6px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", fontSize: "0.8125rem", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1, fontWeight: 500 }}
              >← Prev</button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{ padding: "6px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", fontSize: "0.8125rem", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.4 : 1, fontWeight: 500 }}
              >Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Printable Receipt (Hidden from screen) ─── */}
      <div className="printableReceipt">
        {(printingOrder ? [printingOrder] : printingBatch).map((order, idx) => (
          <div key={order.order_id} style={{ pageBreakAfter: 'always', marginBottom: idx < printingBatch.length - 1 ? 100 : 0 }}>
            <div style={{ textAlign: 'center', marginBottom: "20px" }}>
              <h2 style={{ margin: 0 }}>FLOWPAY RECEIPT</h2>
              <p style={{ margin: 0, opacity: 0.6 }}>Official Merchant Record</p>
            </div>
            <div style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000', padding: '20px 0', margin: '20px 0' }}>
              <p><strong>Merchant ID:</strong> {order.merchant_id || "FlowPay Native"}</p>
              <p><strong>Order ID:</strong> {order.order_id}</p>
              <p><strong>Date:</strong> {fmtDate(order.created_at)}</p>
              <p><strong>Amount:</strong> ₹{order.amount}</p>
              <p><strong>Status:</strong> {order.status.toUpperCase()}</p>
              {order.utr_number && <p><strong>UTR Number:</strong> {order.utr_number}</p>}
            </div>
            <div style={{ textAlign: 'center', fontSize: '10px' }}>
              Verified by FlowPay Sync Engine • {new Date().toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .printableReceipt { display: none; }
        @media print {
          body * { visibility: hidden; }
          .printableReceipt, .printableReceipt * { visibility: visible; }
          .printableReceipt {
            position: absolute;
            left: 0; top: 0; width: 100%;
            display: block !important;
            padding: 40px;
            font-family: serif;
            color: black;
          }
        }
      ` }} />
    </>
  );
}
