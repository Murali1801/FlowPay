import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ShoppingBag, ShieldCheck, Mail, Send, CheckCircle2 } from "lucide-react";
import { checkout, simulateSmsSync } from "../api";
import { FLOWPAY_LOGO_URL } from "../logo";
import styles from "./SandboxPage.module.css";

const DEMO_KEY = import.meta.env.VITE_FLOWPAY_MERCHANT_API_KEY as string | undefined;
const DEMO_MID = import.meta.env.VITE_FLOWPAY_MERCHANT_ID as string | undefined;

export default function SandboxPage() {
  const [activeTab, setActiveTab] = useState<"checkout" | "sync">("checkout");
  const [amount, setAmount] = useState("1499.00");
  const [utr, setUtr] = useState("424242424242");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function onCheckout(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const opts =
        DEMO_KEY && DEMO_KEY.length > 0
          ? { apiKey: DEMO_KEY, merchantId: DEMO_MID && DEMO_MID.length > 0 ? DEMO_MID : undefined }
          : undefined;
      const { order_id } = await checkout(amount, opts);
      navigate(`/pay/${order_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function onSync(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await simulateSmsSync({ amount: Number(amount), utr, merchant_id: DEMO_MID }, token);
      setSuccess(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync simulation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.sandboxBadge}>MERCHANT SANDBOX</div>
        
        <div className={styles.brandRow}>
          <img
            src={FLOWPAY_LOGO_URL}
            alt="FlowPay"
            width={44}
            height={44}
            className={styles.brandMark}
            decoding="async"
          />
          <p className={`${styles.brand} flowpay-wordmark`}>FlowPay</p>
        </div>
        
        <div className={styles.tabTrack}>
          <button className={`${styles.tab} ${activeTab === 'checkout' ? styles.tabActive : ''}`} onClick={() => setActiveTab('checkout')}>
            <ShoppingBag size={14} /> Transaction
          </button>
          <button className={`${styles.tab} ${activeTab === 'sync' ? styles.tabActive : ''}`} onClick={() => setActiveTab('sync')}>
            <Mail size={14} /> SMS Sync
          </button>
        </div>

        <h1 className={styles.title}>{activeTab === 'checkout' ? "Simulate Transaction" : "SMS Sync Simulator"}</h1>
        <p className={styles.sub}>
          {activeTab === 'checkout' 
            ? "Directly initiate a secure payment session to test your integration. The transaction will be tracked in real-time."
            : "Manually trigger a mocked bank SMS payload to verify your MacroDroid rules and webhook parsing logic."}
        </p>

        {activeTab === 'checkout' ? (
          <form onSubmit={onCheckout} className={styles.form}>
            <label className={styles.label}>
              Order Amount (INR)
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-3)' }}>₹</span>
                <input
                  className={styles.input}
                  style={{ paddingLeft: '2.4rem' }}
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  placeholder="0.00"
                />
              </div>
            </label>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? "Initialising Secure Session…" : (
                <>
                  <ShoppingBag size={18} /> Continue to pay
                  <ArrowRight size={18} style={{ marginLeft: "auto" }} />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={onSync} className={styles.form}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label className={styles.label}>
                Amount (INR)
                <input className={styles.input} type="text" value={amount} onChange={e => setAmount(e.target.value)} required />
              </label>
              <label className={styles.label}>
                UTR Number
                <input className={styles.input} type="text" value={utr} onChange={e => setUtr(e.target.value)} required />
              </label>
            </div>
            <label className={styles.label}>
              Webhook Bearer Token
              <input className={styles.input} type="password" value={token} onChange={e => setToken(e.target.value)} placeholder="Paste your sync token" required />
            </label>

            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}><CheckCircle2 size={14} /> {success}</div>}

            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? "Simulating Webhook Call…" : (
                <>
                  <Send size={18} /> Simulate SMS Sync
                  <ArrowRight size={18} style={{ marginLeft: "auto" }} />
                </>
              )}
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--text-4)', fontSize: '0.75rem', fontWeight: 600 }}>
          <ShieldCheck size={14} /> PCI-DSS COMPLIANT • 256-BIT ENCRYPTION
        </div>

        <p className={styles.footer}>
          Are you a merchant? <Link to="/admin/login">Dashboard Access</Link>
        </p>
      </div>
    </div>
  );
}
