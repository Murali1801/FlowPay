import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import {
  ChevronLeft, ShieldCheck, MapPin, ShoppingCart, Tag,
  LogOut, Smartphone, Copy,
  Eye
} from "lucide-react";
import { getOrder } from "../../api";
import { useAuth } from "../../contexts/AuthContext";
import { buildUpiLink } from "../../upi";
import FlowPaySplash from "./FlowPaySplash";
import { FlowPayMarkSmall } from "./FlowPayMark";
import OrderSummaryModal from "./OrderSummaryModal";
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

export default function FlowPayCheckoutPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user, logOut } = useAuth();
  const [phase, setPhase] = useState<"splash" | "main">("splash");
  const [order, setOrder] = useState<any>(null);
  const [amount, setAmount] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Pending");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [orderSummaryOpen, setOrderSummaryOpen] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  async function handleLogout() {
    await logOut();
    navigate("/");
  }

  const cleanAmount = useMemo(() => {
    if (!amount) return "0.00";
    return parseAmount(amount).toFixed(2);
  }, [amount]);

  const upiLink = useMemo(() => {
    if (!amount || !orderId) return "";
    return buildUpiLink(cleanAmount, PA, PN, {
      note: `FlowPay Order`,
    });
  }, [cleanAmount, orderId]);

  const prices = useMemo(() => {
    const pay = amount ? parseAmount(amount) : 0;
    const savingsNum = Math.round(pay * 0.15); // 15% mockup discount
    const mrp = pay + savingsNum;
    const mrpStr = fmt(mrp);
    const discountStr = fmt(savingsNum);
    const subStr = fmt(pay);
    return {
      pay,
      savingsRupee: savingsNum,
      mrpStr,
      discountStr,
      subStr,
    };
  }, [amount]);

  useEffect(() => {
    const t = window.setTimeout(() => setPhase("main"), 2200);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    (async () => {
      try {
        const o = await getOrder(orderId);
        if (cancelled) return;
        setOrder(o);
        setAmount(o.amount);
        setStatus(o.status);
        if (o.status === "Paid") {
          navigate(`/success/${orderId}`, { replace: true, state: { returnUrl: o.return_url } });
        }
      } catch {
        if (!cancelled) setLoadError("Unable to load checkout. Please try again.");
      }
    })();
    return () => { cancelled = true; };
  }, [orderId, navigate]);

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

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  }

  async function copyToClipboard(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} copied`);
    } catch { showToast("Copy failed"); }
  }

  if (!orderId) return null;

  if (loadError) {
    return (
      <div className={s.page}>
        <div className={s.card} style={{ margin: "40px auto", maxWidth: 400, textAlign: "center" }}>
          <p style={{ color: "var(--fp-red)", fontWeight: 600 }}>{loadError}</p>
          <Link to="/" style={{ display: "inline-block", marginTop: 16, color: "var(--fp-teal-dark)", fontWeight: 700 }}>Back to home</Link>
        </div>
      </div>
    );
  }

  if (phase === "splash") return <div className={s.page}><FlowPaySplash /></div>;

  if (!amount) return <div className={s.page}><div style={{ margin: "auto", color: "var(--text-4)" }}>Connecting to secure servers…</div></div>;

  const sessionShort = orderId.replace(/-/g, "").slice(0, 8);

  return (
    <div className={s.page}>
      <OrderSummaryModal
        open={orderSummaryOpen}
        onClose={() => setOrderSummaryOpen(false)}
        mrp={prices.mrpStr}
        discount={prices.discountStr}
        subtotal={prices.subStr}
        items={order?.items}
      />

      <header className={s.header}>
        <button type="button" className={s.back} onClick={() => navigate("/")} aria-label="Back">
          <ChevronLeft size={24} />
        </button>
        <img src="/logo.png" alt="FlowPay" className={s.headerLogo} />
        <div className={s.securePill}>
          <ShieldCheck size={14} /> <span>SECURED</span>
        </div>
      </header>

      <div className={s.waBar}>⚡ Order now to get ₹{prices.savingsRupee} cashback in FlowPay wallet</div>

      {toast && <div className={s.toastBar}>{toast}</div>}

      <main className={s.main}>
        {/* Order Summary */}
        <button type="button" className={s.summaryCard} onClick={() => setOrderSummaryOpen(true)}>
          <div className={s.summaryRow}>
            <div className={s.summaryLeft}>
              <ShoppingCart size={20} className={s.cartIco} />
              <div>
                <div className={s.summaryTitle}>Check Order Summary</div>
                <span className={s.savedPill}>TOTAL SAVINGS ₹{prices.savingsRupee}</span>
              </div>
            </div>
            <div className={s.summaryRight}>
              <div>
                <span className={s.strike}>₹{prices.mrpStr}</span>
                <span className={s.payStrong}> ₹{prices.subStr}</span>
                <span className={s.chev}>▼</span>
              </div>
            </div>
          </div>
        </button>

        <p className={s.sectionLabel}>Shipping & Delivery</p>
        <section className={s.card}>
          <div className={s.addrRow}>
            <div className={s.addrLeft}>
              <MapPin size={20} className={s.pin} />
              <div>
                <div className={s.deliver}>
                  DELIVERING TO {order?.shipping_address?.full_name || order?.customer_details?.name || "CUSTOMER"}
                </div>
                <div className={s.addrText}>
                  {order?.shipping_address
                    ? `${order.shipping_address.address_line_1}, ${order.shipping_address.city}, ${order.shipping_address.state} - ${order.shipping_address.pincode}`
                    : "Fetching address details..."}
                </div>
                <div className={s.addrMeta}>
                  {order?.customer_details?.phone || order?.shipping_address?.phone || "+91 XXXXXXXXXX"} · {order?.customer_details?.email || "customer@example.com"}
                </div>
              </div>
            </div>
            <button type="button" className={s.changeBtn}>CHANGE</button>
          </div>
          <div className={s.shipBox}>
            <div className={s.shipLine}>
              FlowPay Fast Delivery <span className={s.freeBadge}>FREE</span>
            </div>
            <div className={s.shipSub}>Arriving by tomorrow evening</div>
          </div>
        </section>

        <p className={s.sectionLabel}>Offers & Coupons</p>
        <div className={s.couponRow}>
          <Tag size={18} className={s.couponIcon} />
          <input
            className={s.couponInput}
            placeholder="Enter coupon code"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            disabled={couponApplied}
          />
          <button
            type="button"
            className={s.changeBtn}
            disabled={couponApplied || !coupon.trim()}
            onClick={() => {
              setCouponApplied(true);
              showToast("Coupon Applied!");
            }}
          >
            {couponApplied ? "APPLIED ✓" : "APPLY"}
          </button>
        </div>

        <p className={s.sectionLabel}>Payment Method</p>
        <section className={s.payCard}>
          <div className={s.payHead}>
            <div className={s.payHeadL}>
              <Smartphone size={20} className={s.upiIco} />
              <span className={s.payTitle}>UPI / QR / Instant App</span>
            </div>
            <span className={s.payAmt}>₹{prices.subStr}</span>
          </div>

          <div className={s.qrRow}>
            <div className={s.qrBox}>
              <div className={`${s.qrInner} ${showQr ? s.qrShown : s.qrHidden}`}>
                <QRCode value={upiLink} size={136} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
              </div>
              {!showQr && (
                <button type="button" className={s.showQrBtn} onClick={() => setShowQr(true)}>
                  <Eye size={20} />
                  <span>SHOW QR CODE</span>
                </button>
              )}
            </div>

            <div className={s.qrCopy}>
              <div className={s.liveIndicator}>
                <span className={s.pulseDot}></span>
                <span>WAITING FOR PAYMENT</span>
              </div>
              
              <p className={s.qrInstr}>Scan the QR above using any UPI app (GPay, PhonePe, Paytm, etc.) to complete your secure transaction.</p>
              
              <div className={s.miniActions}>
                <button type="button" className={s.ghostBtn} onClick={() => copyToClipboard("UPI ID", PA)}>
                  <Copy size={12} style={{ marginRight: 4 }} /> Copy UPI ID
                </button>
                <button type="button" className={s.ghostBtn} onClick={() => copyToClipboard("Order", orderId)}>
                  <Copy size={12} style={{ marginRight: 4 }} /> Copy Order ID
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className={s.userCard}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--bg-alt)", display: "flex", alignItems: "center", justifyContent: "center", fontStyle: "normal" }}>👤</div>
            <div style={{ fontSize: "0.875rem", color: "var(--text-2)" }}>
              {user ? <span>Logged in as <b>{user.email}</b></span> : <span>Checking out as Guest</span>}
            </div>
          </div>
          <button type="button" className={s.logout} style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--fp-red)", background: "none", border: "none", cursor: "pointer" }} onClick={() => void handleLogout()}>
            <LogOut size={14} style={{ marginRight: 4, display: "inline" }} /> LOGOUT
          </button>
        </div>

        <div className={s.poweredBlock}>
          <div className={s.poweredArc}>POWERED BY</div>
          <div className={s.poweredRow}>
            <FlowPayMarkSmall />
            <span className={s.poweredName}>FLOWPAY PRODUCTION SDK 2.0</span>
          </div>
        </div>

        <div className={s.trustRow}>
          <div className={s.trustItem}><ShieldCheck size={10} style={{ display: "inline" }} /> PCI COMPLIANT</div>
          <div className={s.trustItem}>🔒 SECURE</div>
          <div className={s.trustItem}>✓ VERIFIED</div>
        </div>

        <div className={s.sessionId}>REF: {sessionShort}</div>
        <p className={s.legal}>
          By clicking pay you agree to our <u>Terms</u> and <u>Privacy Policy</u>.
        </p>
        <p className={s.pollNote}>Status will update immediately once payment is confirmed.</p>
      </main>
    </div>
  );
}
