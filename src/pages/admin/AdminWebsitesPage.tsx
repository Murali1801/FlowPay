import { useCallback, useEffect, useState } from "react";
import {
  Plus, Globe, Eye, EyeOff, Copy, Check,
  RefreshCw, X, ShieldCheck, Webhook, AlertCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import {
  listMerchants, createMerchant, getMerchantApiKey, rotateMerchantKey,
  type MerchantSummary, type MerchantResponse,
} from "../../api";
import s from "./AdminWebsitesPage.module.css";
import ls from "./AdminLayout.module.css";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return d; }
}

type KeyState = { [merchantId: string]: string | null };
type VisibleState = { [merchantId: string]: boolean };

export default function AdminWebsitesPage() {
  const { getAccessToken } = useAuth();
  const [merchants, setMerchants] = useState<MerchantSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  /* modal state */
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [newStore, setNewStore] = useState<MerchantResponse | null>(null);

  /* API key per card */
  const [apiKeys, setApiKeys] = useState<KeyState>({});
  const [visible, setVisible] = useState<VisibleState>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [rotating, setRotating] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const data = await listMerchants(token);
      setMerchants(data);
      setErr(null);
    } catch (e) { setErr(e instanceof Error ? e.message : "Failed to load stores"); }
    finally { setLoading(false); }
  }, [getAccessToken]);

  useEffect(() => { void load(); }, [load]);

  async function revealKey(mid: string) {
    if (apiKeys[mid] !== undefined) {
      setVisible(v => ({ ...v, [mid]: !v[mid] }));
      return;
    }
    try {
      const token = await getAccessToken();
      const key = await getMerchantApiKey(token, mid);
      setApiKeys(k => ({ ...k, [mid]: key }));
      setVisible(v => ({ ...v, [mid]: true }));
    } catch { /* silent */ }
  }

  async function rotateKey(mid: string) {
    if (!confirm("Rotate API key? The old key will stop working immediately.")) return;
    setRotating(mid);
    try {
      const token = await getAccessToken();
      const res = await rotateMerchantKey(token, mid);
      setApiKeys(k => ({ ...k, [mid]: res.api_key }));
      setVisible(v => ({ ...v, [mid]: true }));
    } catch (e) { alert(e instanceof Error ? e.message : "Rotation failed"); }
    finally { setRotating(null); }
  }

  function copyText(text: string, id: string) {
    void navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = await getAccessToken();
      const res = await createMerchant(token, { name, domain });
      setNewStore(res);
      setApiKeys(k => ({ ...k, [res.merchant_id]: res.api_key }));
      setVisible(v => ({ ...v, [res.merchant_id]: true }));
      await load();
    } catch (e) { alert(e instanceof Error ? e.message : "Failed to create store"); }
    finally { setSubmitting(false); }
  }

  function closeModal() {
    setShowModal(false);
    setName(""); setDomain(""); setNewStore(null);
  }

  return (
    <>
      <div className={s.pageHead}>
        <div className={s.headLeft}>
          <h2 className={s.pageTitle}>Stores & Integration</h2>
          <p className={s.pageSub}>{merchants.length} store{merchants.length !== 1 ? "s" : ""} registered</p>
        </div>
        <button className={s.addBtn} onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add new store
        </button>
      </div>

      {err && <div className={ls.errorBanner}><AlertCircle size={15} /> {err}</div>}

      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "var(--text-4)" }}>Loading stores…</div>
      ) : merchants.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}><Globe size={28} /></div>
          <h3 className={s.emptyTitle}>No stores yet</h3>
          <p className={s.emptyDesc}>
            Add your first storefront to get an API key and start accepting payments.
          </p>
          <button className={s.addBtn} onClick={() => setShowModal(true)}>
            <Plus size={15} /> Add your first store
          </button>
        </div>
      ) : (
        <div className={s.grid}>
          {merchants.map((m) => {
            const key = apiKeys[m.merchant_id];
            const show = visible[m.merchant_id];
            const webhookUrl = `${BASE_URL}/api/webhook/sms-sync`;
            return (
              <div className={s.card} key={m.merchant_id}>
                <div className={s.cardHeader}>
                  <div className={s.cardAvatar}>
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={s.cardHeaderText}>
                    <div className={s.cardName}>{m.name}</div>
                    <div className={s.cardDomain}><Globe size={11} /> {m.domain}</div>
                  </div>
                </div>

                <div className={s.cardBody}>
                  {/* API key row */}
                  <div className={s.keyRow}>
                    <div className={s.keyLabel}>
                      <ShieldCheck size={11} style={{ display: "inline", marginRight: 4 }} />
                      API Key
                    </div>
                    <div className={s.keyInner}>
                      <span className={`${s.keyValue} ${!show ? s.keyHidden : ""}`}>
                        {key && show ? key : "fp_live_••••••••••••••••••••••"}
                      </span>
                      <button
                        className={s.iconBtn}
                        onClick={() => void revealKey(m.merchant_id)}
                        title={show ? "Hide key" : "Reveal key"}
                      >
                        {show ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      {key && (
                        <button
                          className={`${s.iconBtn} ${s.iconBtnGreen}`}
                          onClick={() => copyText(key, `key-${m.merchant_id}`)}
                          title="Copy API key"
                        >
                          {copied === `key-${m.merchant_id}` ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Merchant ID row */}
                  <div className={s.keyRow}>
                    <div className={s.keyLabel}>Merchant ID</div>
                    <div className={s.keyInner}>
                      <span className={s.keyValue}>{m.merchant_id}</span>
                      <button
                        className={`${s.iconBtn} ${s.iconBtnGreen}`}
                        onClick={() => copyText(m.merchant_id, `mid-${m.merchant_id}`)}
                        title="Copy merchant ID"
                      >
                        {copied === `mid-${m.merchant_id}` ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Webhook URL */}
                  <div className={s.webhookUrl}>
                    <div className={s.keyLabel}>
                      <Webhook size={11} style={{ display: "inline", marginRight: 4 }} />
                      Webhook Endpoint
                    </div>
                    <div className={s.keyInner}>
                      <span className={s.keyValue}>{webhookUrl}</span>
                      <button
                        className={`${s.iconBtn} ${s.iconBtnGreen}`}
                        onClick={() => copyText(webhookUrl, `wh-${m.merchant_id}`)}
                        title="Copy webhook URL"
                      >
                        {copied === `wh-${m.merchant_id}` ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className={s.cardFooter}>
                  <span className={s.cardMeta}>Added {formatDate(m.created_at)}</span>
                  <button
                    className={s.rotateBtn}
                    onClick={() => void rotateKey(m.merchant_id)}
                    disabled={rotating === m.merchant_id}
                  >
                    <RefreshCw size={12} className={rotating === m.merchant_id ? "animate-spin" : ""} />
                    Rotate key
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Store Modal ──────────────────── */}
      {showModal && (
        <div className={s.overlay} onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className={s.modal}>
            <div className={s.modalHead}>
              <h3 className={s.modalTitle}>
                {newStore ? "Store created!" : "Add new store"}
              </h3>
              <button className={s.modalClose} onClick={closeModal}><X size={16} /></button>
            </div>
            <div className={s.modalBody}>
              {!newStore ? (
                <form onSubmit={(e) => void handleCreate(e)}>
                  <div className={s.formGroup}>
                    <label className={s.formLabel}>Store name</label>
                    <input
                      className={s.formInput}
                      type="text"
                      placeholder="My Awesome Store"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      maxLength={120}
                    />
                  </div>
                  <div className={s.formGroup}>
                    <label className={s.formLabel}>Domain</label>
                    <input
                      className={s.formInput}
                      type="text"
                      placeholder="yourbrand.com"
                      value={domain}
                      onChange={e => setDomain(e.target.value)}
                      required
                    />
                    <p className={s.formHint}>The domain where this store is hosted (for identification only).</p>
                  </div>
                  <div className={s.modalFoot}>
                    <button type="button" className={s.cancelBtn} onClick={closeModal}>Cancel</button>
                    <button type="submit" className={s.submitBtn} disabled={submitting}>
                      {submitting ? "Creating…" : <><Plus size={15} /> Create store</>}
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <p style={{ fontSize: "0.9375rem", color: "var(--text-3)", marginBottom: 12, lineHeight: 1.6 }}>
                    Your store <strong style={{ color: "var(--text)" }}>{newStore.name}</strong> is ready. Copy your API key below — it's shown only once.
                  </p>
                  <div className={s.keyBanner}>
                    <div className={s.keyBannerTitle}>
                      <ShieldCheck size={14} /> Your live API key
                    </div>
                    <p className={s.keyBannerDesc}>Save this securely. You won't see it again.</p>
                    <div className={s.keyBannerVal}>
                      <span style={{ wordBreak: "break-all", flex: 1 }}>{newStore.api_key}</span>
                      <button
                        style={{ background: "none", border: "none", cursor: "pointer", color: copied === "new" ? "var(--fp-green)" : "#065f46", display: "flex", padding: 2 }}
                        onClick={() => copyText(newStore.api_key, "new")}
                      >
                        {copied === "new" ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className={s.modalFoot}>
                    <button className={s.submitBtn} onClick={closeModal}>
                      <Check size={15} /> Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
