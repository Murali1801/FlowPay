import { useState } from "react";
import {
  User, Shield, Webhook, AlertTriangle,
  Save, Eye, EyeOff, Copy, Check, RefreshCw,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import ls from "./AdminLayout.module.css";

type Tab = "profile" | "upi" | "webhook" | "security";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "upi", label: "UPI Config", icon: Shield },
  { id: "webhook", label: "Webhooks", icon: Webhook },
  { id: "security", label: "Security", icon: AlertTriangle },
];

const Section = ({
  title, desc, children,
}: { title: string; desc?: string; children: React.ReactNode }) => (
  <div style={{
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)", overflow: "hidden",
    boxShadow: "var(--shadow-sm)", marginBottom: 20,
  }}>
    <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border-light)", background: "var(--bg-alt)" }}>
      <h3 style={{ fontFamily: "var(--font-brand)", fontSize: "0.9375rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>{title}</h3>
      {desc && <p style={{ fontSize: "0.8125rem", color: "var(--text-4)", margin: "4px 0 0" }}>{desc}</p>}
    </div>
    <div style={{ padding: 24 }}>{children}</div>
  </div>
);

const Field = ({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "var(--text-2)", marginBottom: 6 }}>{label}</label>
    {children}
    {hint && <p style={{ fontSize: "0.8125rem", color: "var(--text-4)", marginTop: 5 }}>{hint}</p>}
  </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    style={{
      width: "100%", padding: "10px 14px",
      border: "1.5px solid var(--border)", borderRadius: "var(--radius)",
      background: "var(--surface)", color: "var(--text)", fontSize: "0.9375rem",
      outline: "none", transition: "border-color .15s, box-shadow .15s",
      ...props.style,
    }}
    onFocus={e => { e.target.style.borderColor = "var(--fp-teal)"; e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,.12)"; }}
    onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
  />
);

const SaveBtn = ({ loading, onClick }: { loading?: boolean; onClick?: () => void }) => (
  <button
    onClick={onClick}
    style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "10px 20px", background: "linear-gradient(135deg, var(--fp-teal), var(--fp-teal-dark))",
      color: "#fff", border: "none", borderRadius: "var(--radius)",
      fontSize: "0.875rem", fontWeight: 700, cursor: "pointer",
      boxShadow: "0 3px 10px rgba(14,165,233,.3)", transition: "all .18s",
    }}
  >
    {loading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
    {loading ? "Saving…" : "Save changes"}
  </button>
);

export default function AdminSettingsPage() {
  const { profile } = useAuth();
  const [tab, setTab] = useState<Tab>("profile");
  const [saved, setSaved] = useState(false);

  // Profile
  const [displayName, setDisplayName] = useState("");
  const [company, setCompany] = useState("");

  // UPI
  const [upiId, setUpiId] = useState("");
  const [upiName, setUpiName] = useState("");

  // Webhook
  const [bearerToken, setBearerToken] = useState("••••••••••••••••••••••••••••••••");
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");

  function fakeSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function copyToken() {
    void navigator.clipboard.writeText(bearerToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function rotateToken() {
    if (!confirm("Regenerate webhook bearer token? All existing MacroDroid rules must be updated.")) return;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const newToken = Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setBearerToken(newToken);
    setShowToken(true);
  }

  return (
    <>
      {/* ── Page Head ───────────────────────── */}
      <div className={ls.pageHeaderSplit}>
        <div>
          <h2 className={ls.pageTitle}>Settings</h2>
          <p className={ls.pageSub}>Manage your account and integration configuration</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className={ls.tabContainer}>
        <div className={ls.tabTrack}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`${ls.tabBtn} ${tab === id ? ls.tabBtnActive : ""}`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {saved && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "var(--fp-green-soft)", border: "1px solid rgba(16,185,129,.25)", borderRadius: "var(--radius)", marginBottom: 20, fontSize: "0.875rem", color: "#065f46", fontWeight: 600 }}>
          <Check size={15} /> Changes saved successfully!
        </div>
      )}

      {/* ── Profile Tab ─────────────────────── */}
      {tab === "profile" && (
        <>
          <Section title="Account Information" desc="Your basic profile details">
            <Field label="Email address" hint="Contact support to change your login email.">
              <Input type="email" value={profile?.email ?? ""} readOnly style={{ background: "var(--bg-alt)", color: "var(--text-3)", cursor: "not-allowed" }} />
            </Field>
            <Field label="Display name">
              <Input type="text" placeholder="Your full name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
            </Field>
            <Field label="Company / brand name">
              <Input type="text" placeholder="Your D2C brand" value={company} onChange={e => setCompany(e.target.value)} />
            </Field>
            <SaveBtn onClick={fakeSave} />
          </Section>

          <Section title="Role & Plan" desc="Your current plan and permission level">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ padding: "5px 14px", background: "var(--fp-teal-light)", color: "var(--fp-teal-dark)", borderRadius: "var(--radius-full)", fontSize: "0.8125rem", fontWeight: 700, textTransform: "capitalize" }}>
                {profile?.role ?? "merchant"}
              </span>
              <span style={{ fontSize: "0.875rem", color: "var(--text-3)" }}>Starter Plan — 1.5% per transaction</span>
            </div>
            <div style={{ marginTop: 16 }}>
              <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", background: "linear-gradient(135deg, var(--fp-teal), var(--fp-indigo))", color: "#fff", borderRadius: "var(--radius)", fontSize: "0.875rem", fontWeight: 700, textDecoration: "none", boxShadow: "0 3px 10px rgba(14,165,233,.3)" }}>
                Upgrade to Growth
              </a>
            </div>
          </Section>
        </>
      )}

      {/* ── UPI Config Tab ───────────────────── */}
      {tab === "upi" && (
        <Section title="UPI Configuration" desc="The UPI address that receives payments from your customers">
          <Field label="UPI ID" hint="e.g. yourname@upi or 9999999999@paytm">
            <Input type="text" placeholder="yourname@upi" value={upiId} onChange={e => setUpiId(e.target.value)} />
          </Field>
          <Field label="Payee name (shown to customer)" hint="The name shown on the customer's UPI payment screen.">
            <Input type="text" placeholder="Your Brand Name" value={upiName} onChange={e => setUpiName(e.target.value)} />
          </Field>
          <div style={{ padding: 16, background: "var(--fp-amber-soft)", border: "1px solid rgba(245,158,11,.25)", borderRadius: "var(--radius)", marginBottom: 20, fontSize: "0.875rem", color: "#92400e", display: "flex", gap: 10 }}>
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>Always verify your UPI ID before saving. Incorrect IDs will cause customer payments to fail verification.</span>
          </div>
          <SaveBtn onClick={fakeSave} />
        </Section>
      )}

      {/* ── Webhooks Tab ─────────────────────── */}
      {tab === "webhook" && (
        <>
          <Section title="Webhook Bearer Token" desc="Used to authenticate SMS-sync webhook requests from MacroDroid">
            <Field label="Bearer token">
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, background: "var(--bg-alt)", border: "1.5px solid var(--border)", borderRadius: "var(--radius)", padding: "10px 14px" }}>
                  <span style={{ flex: 1, fontFamily: "'SF Mono','Fira Code',monospace", fontSize: "0.8125rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {showToken ? bearerToken : "•".repeat(32)}
                  </span>
                  <button onClick={() => setShowToken(s => !s)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-4)", display: "flex", padding: 2 }}>
                    {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button onClick={copyToken} style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "var(--fp-green)" : "var(--text-4)", display: "flex", padding: 2 }}>
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                  </button>
                </div>
                <button
                  onClick={rotateToken}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", border: "1.5px solid var(--border)", borderRadius: "var(--radius)", background: "var(--surface)", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-3)", cursor: "pointer", transition: "all .15s", whiteSpace: "nowrap" }}
                >
                  <RefreshCw size={14} /> Rotate
                </button>
              </div>
            </Field>
            <Field label="Webhook callback URL (for MacroDroid)" hint="Paste this URL in your MacroDroid HTTP Request action.">
              <Input type="url" placeholder={`${(import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "")}/api/webhook/sms-sync`} value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} />
            </Field>
          </Section>

          <Section title="MacroDroid Setup Guide" desc="How to connect SMS bank alerts to webhook">
            <ol style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 12, color: "var(--text-3)", fontSize: "0.9375rem", lineHeight: 1.7 }}>
              <li>Open MacroDroid → Create new Macro.</li>
              <li>Trigger: <strong style={{ color: "var(--text)" }}>SMS Received</strong> (filter by your bank sender).</li>
              <li>Action: <strong style={{ color: "var(--text)" }}>HTTP Request → POST</strong> to your webhook URL above.</li>
              <li>Set <code style={{ background: "var(--bg-alt)", padding: "1px 5px", borderRadius: 4 }}>Authorization: Bearer {"<your token>"}</code> header.</li>
              <li>Body: <code style={{ background: "var(--bg-alt)", padding: "1px 5px", borderRadius: 4 }}>{"{ \"amount\": [AMOUNT], \"utr\": \"[UTR]\" }"}</code></li>
            </ol>
          </Section>
        </>
      )}

      {/* ── Security Tab ─────────────────────── */}
      {tab === "security" && (
        <>
          <Section title="Change Password" desc="Update your login password">
            <Field label="Current password">
              <Input type="password" placeholder="••••••••" />
            </Field>
            <Field label="New password">
              <Input type="password" placeholder="Min 8 characters" />
            </Field>
            <Field label="Confirm new password">
              <Input type="password" placeholder="Must match above" />
            </Field>
            <SaveBtn onClick={fakeSave} />
          </Section>

          <Section title="Danger Zone" desc="Irreversible account actions">
            <div style={{ padding: 16, background: "var(--fp-red-soft)", border: "1px solid rgba(239,68,68,.2)", borderRadius: "var(--radius)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#991b1b", marginBottom: 4 }}>Delete account</div>
                <div style={{ fontSize: "0.8125rem", color: "#b91c1c" }}>Permanently delete your account and all associated data. This cannot be undone.</div>
              </div>
              <button style={{ flexShrink: 0, padding: "9px 16px", background: "var(--fp-red)", color: "#fff", border: "none", borderRadius: "var(--radius)", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", transition: "all .15s" }}>
                Delete account
              </button>
            </div>
          </Section>
        </>
      )}
    </>
  );
}
