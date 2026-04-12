import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle, ShoppingBag, ExternalLink, ArrowRight } from "lucide-react";
import { getOrder } from "../api";
import styles from "./SuccessPage.module.css";

export default function SuccessPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [amount, setAmount] = useState<string | null>(null);
  const [utr, setUtr] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    (async () => {
      try {
        const o = await getOrder(orderId);
        if (cancelled) return;
        setAmount(o.amount);
        setUtr(o.utr_number);
      } catch { /* ignored */ }
    })();
    return () => { cancelled = true; };
  }, [orderId]);

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.icon}>
          <CheckCircle size={48} strokeWidth={2.5} />
        </div>
        <h1 className={styles.title}>Payment Successful</h1>
        <p className={styles.sub}>
          Thank you for your order. Your payment has been confirmed and the merchant has been notified.
        </p>

        <div className={styles.details}>
          <div className={styles.row}>
            <span className={styles.label}>Amount Paid</span>
            <span className={styles.amount}>₹{amount || "—"}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Order ID</span>
            <span className={styles.mono}>{orderId?.slice(0, 18)}...</span>
          </div>
          {utr && (
            <div className={styles.row}>
              <span className={styles.label}>Bank UTR</span>
              <span className={styles.mono}>{utr}</span>
            </div>
          )}
          <div className={styles.row}>
            <span className={styles.label}>Status</span>
            <span className={styles.value} style={{ color: "var(--fp-green)" }}>CONFIRMED ✓</span>
          </div>
        </div>

        <div className={styles.btnRow}>
          <Link className={styles.btn} to="/">
            Continue Shopping <ArrowRight size={18} style={{ marginLeft: 8 }} />
          </Link>
          <button className={styles.secondaryBtn} onClick={() => window.print()}>
            Download Receipt
          </button>
        </div>

        <div className={styles.footer}>
          <p>A confirmation email has been sent to your registered address.</p>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 16 }}>
            <a href="#" style={{ color: "var(--text-4)", textDecoration: "none", display: "flex", gap: 4, alignItems: "center" }}>
              <ShoppingBag size={12} /> View Orders
            </a>
            <a href="#" style={{ color: "var(--text-4)", textDecoration: "none", display: "flex", gap: 4, alignItems: "center" }}>
              <ExternalLink size={12} /> Contact Support
            </a>
          </div>
        </div>
      </div>

      {/* ─── Printable Receipt (Hidden from screen) ─── */}
      <div className={styles.printableReceipt}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>FLOWPAY RECEIPT</h2>
          <p style={{ margin: 0, opacity: 0.6 }}>Official Transaction Record</p>
        </div>
        <div style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000', padding: '20px 0', margin: '20px 0' }}>
          <p><strong>Merchant:</strong> FlowPay Production</p>
          <p><strong>Order ID:</strong> {orderId}</p>
          <p><strong>Date:</strong> {new Date().toLocaleString()}</p>
          <p><strong>Amount:</strong> ₹{amount}</p>
          <p><strong>Status:</strong> COMPLETED</p>
          {utr && <p><strong>Bank UTR:</strong> {utr}</p>}
        </div>
        <div style={{ textAlign: 'center', fontSize: '0.8rem' }}>
          Thank you for choosing FlowPay. This is a computer-generated receipt.
        </div>
      </div>
    </div>
  );
}
