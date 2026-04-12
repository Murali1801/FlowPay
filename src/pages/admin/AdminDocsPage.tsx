import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp, BookOpen, Zap, Webhook, Terminal } from "lucide-react";
import ls from "./AdminLayout.module.css";


const BASE = (import.meta.env.VITE_API_BASE_URL ?? "https://api.flowpay.co").replace(/\/$/, "");

type Endpoint = {
  method: "POST" | "GET" | "PATCH";
  path: string;
  desc: string;
  auth: string;
  body?: string;
  response: string;
};

const ENDPOINTS: Endpoint[] = [
  {
    method: "POST",
    path: "/api/checkout",
    desc: "Create a new payment order. Returns an order_id that you redirect the customer to.",
    auth: "X-API-Key: fp_live_YOUR_KEY",
    body: `{\n  "amount": 1499.00,\n  "merchant_id": "optional-merchant-id"\n}`,
    response: `{\n  "order_id": "uuid-v4-string",\n  "amount": "1499.00"\n}`,
  },
  {
    method: "GET",
    path: "/api/orders/{order_id}",
    desc: "Poll this endpoint to check if a payment has been confirmed. Status is Pending or Paid.",
    auth: "None required",
    response: `{\n  "order_id": "...",\n  "amount": "1499.00",\n  "status": "Paid",\n  "utr_number": "424242424242"\n}`,
  },
  {
    method: "GET",
    path: "/api/admin/stats",
    desc: "Get aggregated stats for your account — total orders, paid, pending, and GMV.",
    auth: "Authorization: Bearer <firebase-id-token>",
    response: `{\n  "total_orders": 247,\n  "pending": 3,\n  "paid": 244,\n  "total_paid_amount": "184320.00"\n}`,
  },
  {
    method: "GET",
    path: "/api/admin/orders",
    desc: "List all orders visible to your account (max 500). Sorted by newest first.",
    auth: "Authorization: Bearer <firebase-id-token>",
    response: `[\n  { "order_id": "...", "amount": "999.00", "status": "Paid", ... }\n]`,
  },
  {
    method: "POST",
    path: "/api/webhook/sms-sync",
    desc: "Called by MacroDroid when an SMS credit alert is received. Marks matching order as Paid.",
    auth: "Authorization: Bearer <webhook-bearer-token>",
    body: `{\n  "amount": 1499.00,\n  "utr": "424242424242",\n  "merchant_id": "optional"\n}`,
    response: `{\n  "matched": true,\n  "order_id": "...",\n  "message": "Order marked paid"\n}`,
  },
];

const CODE_JS = `// 1. Create a checkout session (from your backend)
const res = await fetch("${BASE}/api/checkout", {
  method: "POST",
  headers: {
    "X-API-Key": "fp_live_YOUR_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ amount: 1499.00 }),
});
const { order_id } = await res.json();

// 2. Send customer to the FlowPay checkout page
window.location.href = "https://app.flowpay.co/pay/" + order_id;

// 3. Poll for payment confirmation (optional — webhook is preferred)
const pollOrder = async (orderId) => {
  const r = await fetch(\`${BASE}/api/orders/\${orderId}\`);
  const data = await r.json();
  if (data.status === "Paid") {
    console.log("Success! UTR:", data.utr_number);
  }
};
// 4. (Recommended) Register your webhook in settings to get instant POST notifications.
`;

const CODE_PY = `import requests

# 1. Create a checkout session
response = requests.post(
    "${BASE}/api/checkout",
    headers={
        "X-API-Key": "fp_live_YOUR_KEY",
        "Content-Type": "application/json",
    },
    json={"amount": 1499.00},
)
order = response.json()
order_id = order["order_id"]

# 2. Redirect customer
checkout_url = f"https://app.flowpay.co/pay/{order_id}"
print(f"Redirect to: {checkout_url}")`;

const METHOD_COLORS: Record<string, { bg: string; color: string }> = {
  GET: { bg: "#ecfdf5", color: "#065f46" },
  POST: { bg: "#eff6ff", color: "#1e40af" },
  PATCH: { bg: "#fdf4ff", color: "#7e22ce" },
};

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ background: "#0f172a", borderRadius: "var(--radius-md)", overflow: "hidden", marginTop: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "#1e293b" }}>
        <span style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "monospace" }}>{lang}</span>
        <button onClick={copy} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 12px", background: "#334155", color: "#94a3b8", border: "none", borderRadius: 6, fontSize: "0.75rem", cursor: "pointer", transition: "all .15s" }}>
          {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
        </button>
      </div>
      <pre style={{ margin: 0, padding: 20, fontFamily: "'SF Mono','Fira Code','Cascadia Code',monospace", fontSize: "0.8125rem", lineHeight: 1.75, color: "#e2e8f0", overflowX: "auto", whiteSpace: "pre" }}>{code}</pre>
    </div>
  );
}

function EndpointRow({ ep }: { ep: Endpoint }) {
  const [open, setOpen] = useState(false);
  const mc = METHOD_COLORS[ep.method] ?? { bg: "#f1f5f9", color: "#334155" };
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: 10 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: open ? "var(--fp-teal-soft)" : "var(--surface)", border: "none", cursor: "pointer", textAlign: "left", transition: "background .15s" }}
      >
        <span style={{ padding: "3px 10px", borderRadius: "var(--radius-sm)", fontFamily: "monospace", fontSize: "0.75rem", fontWeight: 700, background: mc.bg, color: mc.color, flexShrink: 0 }}>
          {ep.method}
        </span>
        <code style={{ flex: 1, fontFamily: "monospace", fontSize: "0.875rem", color: "var(--text-2)" }}>{ep.path}</code>
        <span style={{ fontSize: "0.8125rem", color: "var(--text-4)", marginRight: 8 }}>{ep.desc.slice(0, 60)}…</span>
        {open ? <ChevronUp size={16} color="var(--text-4)" /> : <ChevronDown size={16} color="var(--text-4)" />}
      </button>
      {open && (
        <div style={{ padding: "16px 18px", borderTop: "1px solid var(--border-light)", background: "#fafafa" }}>
          <p style={{ fontSize: "0.9375rem", color: "var(--text-3)", marginBottom: 14, lineHeight: 1.6 }}>{ep.desc}</p>
          <div style={{ display: "grid", gridTemplateColumns: ep.body ? "1fr 1fr" : "1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Auth</div>
              <code style={{ display: "block", padding: "8px 12px", background: "var(--bg-alt)", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem", color: "var(--text-2)", fontFamily: "monospace" }}>{ep.auth}</code>
              {ep.body && <>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "14px 0 6px" }}>Request Body</div>
                <pre style={{ margin: 0, padding: "10px 12px", background: "#0f172a", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem", color: "#e2e8f0", fontFamily: "monospace", lineHeight: 1.7, overflowX: "auto" }}>{ep.body}</pre>
              </>}
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Response</div>
              <pre style={{ margin: 0, padding: "10px 12px", background: "#0f172a", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem", color: "#86efac", fontFamily: "monospace", lineHeight: 1.7, overflowX: "auto" }}>{ep.response}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDocsPage() {
  const [langTab, setLangTab] = useState<"js" | "python">("js");

  return (
    <>
      <div className={ls.pageHeaderSplit}>
        <div>
          <h2 className={ls.pageTitle}>Developer Docs</h2>
          <p className={ls.pageSub}>Integrate FlowPay payments into your storefront</p>
        </div>
      </div>

      {/* Quick start */}
      <div className={ls.cardPanel}>
        <div className={ls.cardPanelHead}>
          <Zap size={17} color="var(--fp-teal-dark)" />
          <h3 className={ls.cardPanelTitle}>Quick Start</h3>
        </div>
        <div className={ls.cardPanelBody}>
          <p className={ls.docsText}>
            Get up and running in under 10 minutes. Your integration is two steps: <strong style={{ color: "var(--text)" }}>POST /api/checkout</strong> → redirect customer to <code className={ls.inlineCode}>/pay/{"{order_id}"}</code>.
          </p>

          <div className={ls.langTabs}>
            {(["js", "python"] as const).map(l => (
              <button key={l} onClick={() => setLangTab(l)} className={`${ls.langTabBtn} ${langTab === l ? ls.langTabBtnActive : ""}`}>
                {l === "js" ? "JavaScript" : "Python"}
              </button>
            ))}
          </div>
          <CodeBlock code={langTab === "js" ? CODE_JS : CODE_PY} lang={langTab === "js" ? "javascript" : "python"} />
        </div>
      </div>

      {/* API reference */}
      <div className={ls.cardPanel}>
        <div className={ls.cardPanelHead}>
          <BookOpen size={17} color="var(--fp-teal-dark)" />
          <h3 className={ls.cardPanelTitle}>API Reference</h3>
          <span className={ls.docsBaseUrl}>Base URL: <code className={ls.inlineCode}>{BASE}</code></span>
        </div>
        <div className={ls.docsList}>
          {ENDPOINTS.map((ep) => <EndpointRow key={ep.path + ep.method} ep={ep} />)}
        </div>
      </div>

      {/* Webhook guide */}
      <div className={ls.cardPanel}>
        <div className={ls.cardPanelHead}>
          <Webhook size={17} color="var(--fp-teal-dark)" />
          <h3 className={ls.cardPanelTitle}>Webhook & MacroDroid</h3>
        </div>
        <div className={ls.cardPanelBody}>
          <p className={ls.docsText}>
            FlowPay uses an SMS-based verification system. When your bank sends an SMS credit alert, a MacroDroid macro on your Android device reads it and calls the FlowPay webhook.
          </p>
          <div className={ls.stepList}>
            {[
              { num: "01", title: "Setup Android Hub", desc: "Open the FlowPay app on your Android device and ensure sync is active." },
              { num: "02", title: "Define Trigger Rules", desc: "Use 'Sync Settings' on mobile to set bank filters or custom Regex patterns." },
              { num: "03", title: "Copy Webhook Key", desc: "Copy your unique Bearer token from the mobile app to your sync tool." },
              { num: "04", title: "Test with Simulator", desc: "Use the Web Sandbox 'SMS Sync' tab to simulate payloads and verify logic." },
              { num: "05", title: "Real-time Verification", desc: "Receive high-priority system notifications on your phone for every sync." },
            ].map(step => (
              <div key={step.num} className={ls.stepItem}>
                <div className={ls.stepNum}>{step.num}</div>
                <div>
                  <div className={ls.stepTitle}>{step.title}</div>
                  <div className={ls.stepDesc}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className={ls.docsHelpBox}>
            <Terminal size={15} color="var(--fp-teal-dark)" />
            <span className={ls.docsHelpText}>
              Need help? Check the <a href="#">community forum</a> or <a href="#">contact support</a>.
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
