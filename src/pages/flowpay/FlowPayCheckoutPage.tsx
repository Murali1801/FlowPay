import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import {
  ShieldCheck, MapPin, Package, Tag, Smartphone,
  Copy, Eye, EyeOff, CheckCircle, Clock, ChevronDown,
  ChevronUp, User, Phone, Mail, Home, Loader2
} from "lucide-react";
import { getOrder } from "../../api";
import { buildUpiLink } from "../../upi";
import FlowPaySplash from "./FlowPaySplash";
import { FlowPayMarkSmall } from "./FlowPayMark";
import s from "./FlowPayCheckoutPage.module.css";

const PA = import.meta.env.VITE_UPI_PA ?? "your_gpay_id@okbank";
const PN = import.meta.env.VITE_UPI_PN ?? "Your Name";
const POLL_MS = 4000;

function fmt(n: number) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function parseAmount(s: string) {
  const v = parseFloat(s.replace(/,/g, ""));
  return Number.isFinite(v) ? v : 0;
}
function formatPhone(ph?: string) {
  if (!ph) return null;
  const t = ph.trim();
  return /^\d{10}$/.test(t) ? `+91 ${t}` : t;
}

export default function FlowPayCheckoutPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<"splash" | "main">("splash");
  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState("Pending");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  // Splash delay
  useEffect(() => {
    const t = window.setTimeout(() => setPhase("main"), 2200);
    return () => window.clearTimeout(t);
  }, []);

  // Initial order fetch
  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    (async () => {
      try {
        const o = await getOrder(orderId);
        if (cancelled) return;
        console.log("[FlowPay] Order loaded:", JSON.stringify(o, null, 2));
        setOrder(o);
        setStatus(o.status);
        if (o.status === "Paid") {
          navigate(`/success/${orderId}`, { replace: true, state: { returnUrl: o.return_url } });
        }
      } catch (e) {
        console.error("[FlowPay] Failed to load order:", e);
        if (!cancelled) setLoadError("Unable to load checkout. Please try again.");
      }
    })();
    return () => { cancelled = true; };
  }, [orderId, navigate]);

  // Poll for payment
  useEffect(() => {
    if (!orderId || status !== "Pending") return;
    const id = window.setInterval(async () => {
      try {
        const o = await getOrder(orderId);
        setStatus(o.status);
        if (o.status === "Paid") {
          navigate(`/success/${orderId}`, { replace: true, state: { returnUrl: o.return_url } });
        }
      } catch { /* ignored */ }
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [orderId, status, navigate]);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(null), 2400);
  }, []);

  const copyText = useCallback(async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} copied!`);
    } catch { showToast("Copy failed"); }
  }, [showToast]);

  const amount = order?.amount ?? null;
  const pay = amount ? parseAmount(amount) : 0;
  const savingsNum = Math.round(pay * 0.15);
  const mrp = pay + savingsNum;
  const upiLink = useMemo(() => {
    if (!amount || !orderId) return "";
    return buildUpiLink(fmt(pay), PA, PN, { note: `FlowPay Order` });
  }, [amount, orderId, pay]);

  const addr = order?.shipping_address;
  const cust = order?.customer_details;
  const items = order?.items ?? [];
  const sessionShort = orderId?.replace(/-/g, "").slice(0, 8) ?? "";

  if (!orderId) return null;
  if (phase === "splash") return <div className={s.page}><FlowPaySplash /></div>;

  if (loadError) {
    return (
      <div className={s.page}>
        <div className={s.errorBox}>
          <span className={s.errorIcon}>⚠️</span>
          <p className={s.errorMsg}>{loadError}</p>
          <button className={s.retryBtn} onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={s.page}>
        <div className={s.loadingBox}>
          <Loader2 size={32} className={s.spinner} />
          <p className={s.loadingText}>Connecting to secure servers…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={s.page}>
      {/* ── Toast ── */}
      {toastMsg && <div className={s.toast}>{toastMsg}</div>}

      {/* ── Header ── */}
      <header className={s.header}>
        <div className={s.headerBrand}>
          <FlowPayMarkSmall />
          <span className={s.headerTitle}>FlowPay</span>
        </div>
        <div className={s.securePill}>
          <ShieldCheck size={13} />
          <span>SECURED</span>
        </div>
      </header>

      {/* ── Cashback Bar ── */}
      <div className={s.cashbackBar}>
        ⚡ Order now to get ₹{savingsNum} cashback in FlowPay wallet
      </div>

      <main className={s.main}>

        {/* ════════════════════════════════════════════ */}
        {/* AMOUNT HERO                                   */}
        {/* ════════════════════════════════════════════ */}
        <div className={s.amountHero}>
          <div className={s.amountLabel}>AMOUNT TO PAY</div>
          <div className={s.amountValue}>₹{fmt(pay)}</div>
          <div className={s.amountSaved}>
            You save ₹{savingsNum} · MRP <s>₹{fmt(mrp)}</s>
          </div>
        </div>

        {/* ════════════════════════════════════════════ */}
        {/* ORDER ITEMS                                   */}
        {/* ════════════════════════════════════════════ */}
        <div className={s.section}>
          <button
            type="button"
            className={s.sectionHeader}
            onClick={() => setSummaryOpen(v => !v)}
          >
            <div className={s.sectionHeaderL}>
              <Package size={16} className={s.sectionIcon} />
              <span>Order Summary</span>
              {items.length > 0 && (
                <span className={s.badge}>{items.length} item{items.length > 1 ? "s" : ""}</span>
              )}
            </div>
            {summaryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {summaryOpen && (
            <div className={s.itemsBody}>
              {items.length > 0 ? items.map((item: any, i: number) => (
                <div key={i} className={s.itemRow}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} className={s.itemThumb} />
                  ) : (
                    <div className={s.itemThumbPlaceholder}><Package size={20} /></div>
                  )}
                  <div className={s.itemMeta}>
                    <div className={s.itemName}>{item.name}</div>
                    <div className={s.itemQty}>Qty: {item.quantity}</div>
                  </div>
                  <div className={s.itemPrice}>₹{fmt(Number(item.price) * item.quantity)}</div>
                </div>
              )) : (
                <div className={s.noItems}>No item details available</div>
              )}
              <div className={s.itemsTotal}>
                <span>Total</span>
                <span>₹{fmt(pay)}</span>
              </div>
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════ */}
        {/* SHIPPING ADDRESS                             */}
        {/* ════════════════════════════════════════════ */}
        <div className={s.section}>
          <div className={s.sectionHeaderStatic}>
            <MapPin size={16} className={s.sectionIcon} />
            <span>Shipping & Delivery</span>
          </div>
          <div className={s.addrBody}>
            {addr ? (
              <>
                <div className={s.addrName}>
                  <User size={13} className={s.addrIcon} />
                  {addr.full_name}
                </div>
                <div className={s.addrLine}>
                  <Home size={13} className={s.addrIcon} />
                  <span>
                    {addr.address_line_1}
                    {addr.address_line_2 ? `, ${addr.address_line_2}` : ""}
                  </span>
                </div>
                <div className={s.addrLine}>
                  <MapPin size={13} className={s.addrIcon} />
                  <span>{addr.city}, {addr.state} — {addr.pincode}</span>
                </div>
                {cust?.phone && (
                  <div className={s.addrLine}>
                    <Phone size={13} className={s.addrIcon} />
                    <span>{formatPhone(cust.phone)}</span>
                  </div>
                )}
                {cust?.email && (
                  <div className={s.addrLine}>
                    <Mail size={13} className={s.addrIcon} />
                    <span>{cust.email}</span>
                  </div>
                )}
              </>
            ) : (
              <div className={s.addrMissing}>
                <Loader2 size={14} className={s.spinner} />
                <span>Fetching address details…</span>
              </div>
            )}
            <div className={s.deliveryChip}>
              <CheckCircle size={13} />
              FlowPay Fast Delivery · <strong>FREE</strong> · Arriving by tomorrow evening
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════ */}
        {/* COUPON                                       */}
        {/* ════════════════════════════════════════════ */}
        <div className={s.section}>
          <div className={s.couponRow}>
            <Tag size={16} className={s.sectionIcon} />
            <input
              className={s.couponInput}
              placeholder="Enter coupon code"
              value={coupon}
              onChange={e => setCoupon(e.target.value)}
              disabled={couponApplied}
            />
            <button
              type="button"
              className={s.couponBtn}
              disabled={couponApplied || !coupon.trim()}
              onClick={() => { setCouponApplied(true); showToast("Coupon Applied!"); }}
            >
              {couponApplied ? "APPLIED ✓" : "APPLY"}
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════════ */}
        {/* PAYMENT — QR                                 */}
        {/* ════════════════════════════════════════════ */}
        <div className={s.section}>
          <div className={s.sectionHeaderStatic}>
            <Smartphone size={16} className={s.sectionIcon} />
            <span>Pay via UPI</span>
            <span className={s.payAmtPill}>₹{fmt(pay)}</span>
          </div>
          <div className={s.payBody}>
            {/* Live status */}
            <div className={s.liveRow}>
              <span className={s.pulseDot} />
              <span>WAITING FOR PAYMENT</span>
            </div>

            {/* QR */}
            <div className={s.qrWrap}>
              <div className={s.qrFrame}>
                <div className={showQr ? s.qrVisible : s.qrBlurred}>
                  <QRCode value={upiLink} size={160} style={{ width: "100%", height: "auto" }} />
                </div>
                {!showQr && (
                  <button type="button" className={s.qrReveal} onClick={() => setShowQr(true)}>
                    <Eye size={22} />
                    <span>TAP TO REVEAL QR</span>
                  </button>
                )}
              </div>
              {showQr && (
                <button type="button" className={s.hideQr} onClick={() => setShowQr(false)}>
                  <EyeOff size={12} /> Hide QR
                </button>
              )}
            </div>

            <p className={s.qrHelp}>
              Open <strong>GPay · PhonePe · Paytm · BHIM</strong> and scan to pay
            </p>

            <div className={s.copyRow}>
              <button type="button" className={s.copyBtn} onClick={() => copyText("UPI ID", PA)}>
                <Copy size={12} /> Copy UPI ID
              </button>
              <button type="button" className={s.copyBtn} onClick={() => copyText("Order ID", orderId)}>
                <Copy size={12} /> Copy Order ID
              </button>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════ */}
        {/* FOOTER                                       */}
        {/* ════════════════════════════════════════════ */}
        <div className={s.footer}>
          <div className={s.poweredBy}>
            <span className={s.poweredLabel}>POWERED BY</span>
            <FlowPayMarkSmall />
            <span className={s.poweredName}>FlowPay SDK 2.0</span>
          </div>
          <div className={s.trustRow}>
            <span className={s.trustItem}><ShieldCheck size={10} /> PCI COMPLIANT</span>
            <span className={s.trustItem}>🔒 SECURE</span>
            <span className={s.trustItem}><Clock size={10} /> 24/7 SUPPORT</span>
          </div>
          <div className={s.refRow}>REF: {sessionShort}</div>
          <p className={s.legal}>By proceeding you agree to our Terms &amp; Privacy Policy.</p>
          <p className={s.pollNote}>Payment status updates automatically.</p>
        </div>

      </main>
    </div>
  );
}
