import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
  Globe,
  Smartphone,
  RefreshCw,
  CheckCircle,
  ChevronDown,
  Copy,
  Check,
  Star,
  Menu,
  X,
} from "lucide-react";
import s from "./LandingPage.module.css";

const FEATURES = [
  {
    icon: Zap,
    title: "Instant UPI Settlements",
    desc: "Payments confirmed in seconds via UPI autopay. Money lands in your account — not a third-party wallet.",
  },
  {
    icon: Shield,
    title: "Bank-grade Security",
    desc: "End-to-end encrypted transactions with PCI-DSS compliant infrastructure and real-time fraud signals.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    desc: "Track GMV, conversion rates, drop-offs, and order trends from a gorgeous merchant dashboard.",
  },
  {
    icon: Globe,
    title: "Multi-store Support",
    desc: "Manage multiple storefronts under one account. Per-store API keys, separate order tracking.",
  },
  {
    icon: Smartphone,
    title: "Mobile-first Checkout",
    desc: "The checkout overlay is optimized for mobile. Customers see a clean QR-scan flow in seconds.",
  },
  {
    icon: RefreshCw,
    title: "Webhook Automation",
    desc: "SMS-based payment verification automatically marks orders paid and fires your success callbacks.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Create your store",
    desc: "Register your merchant account, add your storefront domain, and grab your API key in under 2 minutes.",
  },
  {
    num: "02",
    title: "Drop in the SDK",
    desc: "One POST request from your backend creates a checkout session. Our overlay handles the rest.",
  },
  {
    num: "03",
    title: "Get paid instantly",
    desc: "Customer scans the UPI QR, your webhook fires, and the order is marked Paid — all in real time.",
  },
];

const FAQS = [
  {
    q: "How does FlowPay verify payments without a banking API?",
    a: "FlowPay uses an SMS-based webhook system. When your bank sends an SMS confirming receipt, a lightweight Android app on your device reads it and pings our backend, which then marks the matching order as Paid.",
  },
  {
    q: "Is there a setup fee or monthly subscription?",
    a: "No setup fee. Our Starter plan has zero fixed costs — you pay only a small per-transaction fee. The Growth plan adds advanced analytics and priority support.",
  },
  {
    q: "Can I use FlowPay on multiple websites?",
    a: "Yes. You can register as many storefronts as you need under one merchant account. Each gets its own API key and order tracking.",
  },
  {
    q: "How fast is settlement?",
    a: "Funds land in your UPI-linked bank account as soon as the customer pays — typically under 10 seconds. There is no intermediate holding period.",
  },
  {
    q: "What tech stack do I need to integrate?",
    a: "Any language that can make HTTP POST requests works. We provide sample code for JavaScript, Python, and PHP. The entire integration is a single API call.",
  },
];

const CODE_SNIPPET = `// 1. Create a checkout session
const res = await fetch(
  "https://api.flowpay.co/api/checkout",
  {
    method: "POST",
    headers: {
      "X-API-Key": "fp_live_YOUR_KEY",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount: 1499.00 }),
  }
);

const { order_id } = await res.json();

// 2. Redirect customer to the checkout page
window.location.href =
  \`https://pay.flowpay.co/pay/\${order_id}\`;`;

const MOCK_BARS = [40, 65, 55, 80, 70, 90, 75];

export default function LandingPage() {
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(CODE_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={s.page}>
      {/* ── Navbar ───────────────────────────────── */}
      <nav className={`${s.navbar} ${isMenuOpen ? s.navbarSolid : ""}`}>
        <Link to="/" className={s.brandWrap} onClick={() => setIsMenuOpen(false)}>
          <div className={s.brandMark}>FP</div>
          <span className={s.brandLabel}>FlowPay</span>
        </Link>

        {/* Desktop Nav */}
        <div className={s.navCenter}>
          <a href="#features" className={s.navLink}>Features</a>
          <a href="#how-it-works" className={s.navLink}>How it works</a>
          <a href="#pricing" className={s.navLink}>Pricing</a>
          <a href="#faq" className={s.navLink}>FAQ</a>
        </div>

        <div className={s.navRight}>
          <Link to="/sandbox" className={s.navLink}>Sandbox</Link>
          <Link to="/admin/login" className={s.btnLogin}>Login</Link>
          <Link to="/admin/register" className={s.btnGetStarted}>
            Get started <ArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className={s.mobileToggle} 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu Overlay */}
        <div className={`${s.mobileMenu} ${isMenuOpen ? s.mobileMenuOpen : ""}`}>
          <div className={s.mobileMenuLinks}>
            <a href="#features" className={s.mobileNavLink} onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className={s.mobileNavLink} onClick={() => setIsMenuOpen(false)}>How it works</a>
            <a href="#pricing" className={s.mobileNavLink} onClick={() => setIsMenuOpen(false)}>Pricing</a>
            <a href="#faq" className={s.mobileNavLink} onClick={() => setIsMenuOpen(false)}>FAQ</a>
            <div className={s.mobileMenuDivider} />
            <Link to="/sandbox" className={s.mobileNavLink} onClick={() => setIsMenuOpen(false)}>Sandbox</Link>
            <Link to="/admin/login" className={s.mobileNavLink} onClick={() => setIsMenuOpen(false)}>Login</Link>
            <Link to="/admin/register" className={s.mobileBtn} onClick={() => setIsMenuOpen(false)}>
              Get Started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────── */}
      <section className={s.hero}>
        <div className={s.heroLeft}>
          <div className={s.heroBadge}>
            <Star size={12} fill="currentColor" />
            India's simplest UPI checkout gateway
          </div>
          <h1 className={s.heroTitle}>
            Accept payments,{" "}
            <span className={s.heroTitleAccent}>not delays.</span>
          </h1>
          <p className={s.heroSub}>
            FlowPay gives D2C brands a beautiful, mobile-first checkout powered by instant UPI settlements. Zero setup fees. One API call. Real-time order tracking.
          </p>
          <div className={s.heroActions}>
            <Link to="/admin/register" className={s.btnHeroPrimary}>
              Start for free <ArrowRight size={16} />
            </Link>
            <Link to="/sandbox" className={s.btnHeroSecondary}>
              ▶ Try live demo
            </Link>
          </div>
          <div className={s.heroTrustLine}>
            <div className={s.heroStars}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
            </div>
            <span className={s.heroTrustText}>Trusted by 500+ D2C brands · ₹200 Cr+ processed</span>
          </div>
        </div>

        <div className={s.heroRight}>
          <div className={s.dashMockup}>
            <div className={s.mockHeader}>
              <div className={`${s.mockDot} ${s.mockDotR}`} />
              <div className={`${s.mockDot} ${s.mockDotY}`} />
              <div className={`${s.mockDot} ${s.mockDotG}`} />
              <div className={s.mockUrl}>app.flowpay.co/admin/dashboard</div>
            </div>
            <div className={s.mockBody}>
              <div className={s.mockKpiRow}>
                <div className={s.mockKpi}>
                  <div className={s.mockKpiLabel}>GMV Today</div>
                  <div className={`${s.mockKpiValue} ${s.teal}`}>₹84,320</div>
                </div>
                <div className={s.mockKpi}>
                  <div className={s.mockKpiLabel}>Orders</div>
                  <div className={s.mockKpiValue}>247</div>
                </div>
                <div className={s.mockKpi}>
                  <div className={s.mockKpiLabel}>Success Rate</div>
                  <div className={`${s.mockKpiValue} ${s.green}`}>98.2%</div>
                </div>
              </div>
              <div className={s.mockChart}>
                {MOCK_BARS.map((h, i) => (
                  <div
                    key={i}
                    className={s.mockBar}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              {[
                { id: "fp-8a2c...3f01", amt: "₹1,499", status: "paid" },
                { id: "fp-9d1e...7c88", amt: "₹899", status: "pending" },
                { id: "fp-3b7f...2a44", amt: "₹2,199", status: "paid" },
              ].map((row) => (
                <div className={s.mockOrderRow} key={row.id}>
                  <span className={s.mockOrderId}>{row.id}</span>
                  <span className={s.mockOrderAmt}>{row.amt}</span>
                  <span className={row.status === "paid" ? s.mockOrderPaid : s.mockOrderPending}>
                    {row.status === "paid" ? "Paid" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ───────────────────────────── */}
      <section className={s.stats}>
        <div className={s.statsInner}>
          {[
            { num: "₹200 Cr+", label: "Total GMV processed" },
            { num: "500+", label: "Active D2C brands" },
            { num: "99.9%", label: "Platform uptime" },
            { num: "<3s", label: "Avg checkout time" },
          ].map((stat) => (
            <div className={s.statItem} key={stat.label}>
              <div className={s.statNum}>{stat.num}</div>
              <div className={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Logos Marquee ─────────────────────────── */}
      <section className={s.logos}>
        <p className={s.logosLabel}>Integrated with the tools you already use</p>
        <div className={s.marqueeWrap}>
          <div className={s.marqueeTrack}>
            {["Shopify", "WooCommerce", "Razorpay", "Firebase", "Vercel", "Next.js", "React", "Node.js",
              "Shopify", "WooCommerce", "Razorpay", "Firebase", "Vercel", "Next.js", "React", "Node.js"].map(
              (name, i) => (
                <div className={s.logoChip} key={i}>
                  {name}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────── */}
      <section className={s.features} id="features">
        <div className={s.sectionHead}>
          <div className={s.sectionLabel}>Features</div>
          <h2 className={s.sectionTitle}>Everything you need to sell faster</h2>
          <p className={s.sectionSub}>
            FlowPay handles the entire payment lifecycle — from checkout to settlement — so you can focus on your products.
          </p>
        </div>
        <div className={s.featGrid}>
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div className={s.featCard} key={title}>
              <div className={s.featIcon}>
                <Icon size={22} />
              </div>
              <h3 className={s.featTitle}>{title}</h3>
              <p className={s.featDesc}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ──────────────────────────── */}
      <section className={s.howItWorks} id="how-it-works">
        <div className={s.sectionHead}>
          <div className={s.sectionLabel}>Integration</div>
          <h2 className={s.sectionTitle}>Live in minutes, not weeks</h2>
          <p className={s.sectionSub}>
            FlowPay's developer-first design means you can go from zero to accepting payments in under 10 minutes.
          </p>
        </div>
        <div className={s.howGrid}>
          {STEPS.map((step) => (
            <div className={s.howStep} key={step.num}>
              <div className={s.howNum}>{step.num}</div>
              <h3 className={s.howTitle}>{step.title}</h3>
              <p className={s.howDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Integration Code ───────────────────────── */}
      <section className={s.integration}>
        <div className={s.integrationInner}>
          <div className={s.integrationLeft}>
            <div className={s.sectionLabel}>Developer Friendly</div>
            <h2 className={s.sectionTitle}>One API call to accept payments</h2>
            <p className={s.integrationSub}>
              No SDK required. A single POST request to our checkout endpoint creates a payment session and returns a unique order ID. That's it.
            </p>
            <div className={s.integrationFeats}>
              {["RESTful JSON API with OpenAPI docs", "Webhook-based payment confirmation", "Per-store API keys with rotation", "Full TypeScript types available"].map((f) => (
                <div className={s.integrationFeat} key={f}>
                  <CheckCircle size={16} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className={s.codeCard}>
              <div className={s.codeHeader}>
                <div className={`${s.codeHeaderDot} ${s.codeHeaderDotR}`} />
                <div className={`${s.codeHeaderDot} ${s.codeHeaderDotY}`} />
                <div className={`${s.codeHeaderDot} ${s.codeHeaderDotG}`} />
                <span className={s.codeFileName}>checkout.ts</span>
                <button className={s.codeCopyBtn} onClick={handleCopy}>
                  {copied ? <><Check size={10} /> Copied!</> : <><Copy size={10} /> Copy</>}
                </button>
              </div>
              <div className={s.codeBody}>
                <pre>{CODE_SNIPPET}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────── */}
      <section className={s.pricing} id="pricing">
        <div className={s.sectionHead}>
          <div className={s.sectionLabel}>Pricing</div>
          <h2 className={s.sectionTitle}>Simple, transparent pricing</h2>
          <p className={s.sectionSub}>No hidden fees. No lock-ins. Start free, scale when you need to.</p>
        </div>
        <div className={s.pricingGrid}>
          <div className={s.pricingCard}>
            <div className={s.pricingBadgeLight}>Starter</div>
            <div className={s.pricingName}>Starter</div>
            <div className={s.pricingPrice}>₹0</div>
            <div className={s.pricingPer}>+ 1.5% per successful transaction</div>
            <div className={s.pricingFeatures}>
              {["Up to 3 storefronts", "UPI QR checkout", "Real-time order tracking", "Basic dashboard", "Email support"].map((f) => (
                <div className={s.pricingFeature} key={f}>
                  <CheckCircle size={16} className={s.pricingCheckmark} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <Link to="/admin/register" className={`${s.pricingCta} ${s.pricingCtaLight}`}>
              Get started free
            </Link>
          </div>

          <div className={`${s.pricingCard} ${s.pricingCardFeatured}`}>
            <div className={s.pricingBadge}>Most Popular</div>
            <div className={`${s.pricingName} ${s.pricingNameWhite}`}>Growth</div>
            <div className={`${s.pricingPrice} ${s.pricingPriceWhite}`}>₹2,999</div>
            <div className={`${s.pricingPer} ${s.pricingPerWhite}`}>/month + 0.9% per transaction</div>
            <div className={s.pricingFeatures}>
              {["Unlimited storefronts", "Advanced analytics & charts", "Priority webhook processing", "API key rotation", "Dedicated support", "Custom webhook domains"].map((f) => (
                <div className={`${s.pricingFeature} ${s.pricingFeatureWhite}`} key={f}>
                  <CheckCircle size={16} className={s.pricingCheckmarkWhite} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <Link to="/admin/register" className={`${s.pricingCta} ${s.pricingCtaDark}`}>
              Start Growth plan
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────── */}
      <section className={s.faq} id="faq">
        <div className={s.sectionHead}>
          <div className={s.sectionLabel}>FAQ</div>
          <h2 className={s.sectionTitle}>Frequently asked questions</h2>
        </div>
        <div className={s.faqList}>
          {FAQS.map((faq, i) => (
            <div className={s.faqItem} key={i}>
              <button
                className={s.faqQuestion}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
              >
                {faq.q}
                <ChevronDown
                  size={18}
                  className={`${s.faqChevron} ${openFaq === i ? s.faqChevronOpen : ""}`}
                />
              </button>
              <div className={`${s.faqAnswer} ${openFaq === i ? s.faqAnswerOpen : ""}`}>
                <p className={s.faqAnswerInner}>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────── */}
      <section className={s.ctaBanner}>
        <h2 className={s.ctaTitle}>Start accepting UPI payments today.</h2>
        <p className={s.ctaSub}>Join 500+ brands using FlowPay to convert faster and settle instantly.</p>
        <div className={s.ctaActions}>
          <Link to="/admin/register" className={s.ctaBtnPrimary}>
            Create free account <ArrowRight size={16} />
          </Link>
          <Link to="/sandbox" className={s.ctaBtnSecondary}>
            Try the demo first
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────── */}
      <footer className={s.footer}>
        <div className={s.footerTop}>
          <div className={s.footerBrand}>
            <div className={s.footerBrandRow}>
              <div className={s.footerBrandMark}>FP</div>
              <span className={s.footerBrandName}>FlowPay</span>
            </div>
            <p className={s.footerDesc}>
              India's simplest UPI checkout gateway for D2C brands. Instant settlements, zero lock-ins.
            </p>
          </div>
          <div className={s.footerCol}>
            <div className={s.footerColTitle}>Product</div>
            <div className={s.footerLinks}>
              <a href="#features" className={s.footerLink}>Features</a>
              <a href="#pricing" className={s.footerLink}>Pricing</a>
              <Link to="/sandbox" className={s.footerLink}>Sandbox</Link>
              <Link to="/admin/docs" className={s.footerLink}>API Docs</Link>
            </div>
          </div>
          <div className={s.footerCol}>
            <div className={s.footerColTitle}>Company</div>
            <div className={s.footerLinks}>
              <a href="#" className={s.footerLink}>About</a>
              <a href="#" className={s.footerLink}>Blog</a>
              <a href="#" className={s.footerLink}>Careers</a>
              <a href="#" className={s.footerLink}>Contact</a>
            </div>
          </div>
          <div className={s.footerCol}>
            <div className={s.footerColTitle}>Legal</div>
            <div className={s.footerLinks}>
              <a href="#" className={s.footerLink}>Privacy Policy</a>
              <a href="#" className={s.footerLink}>Terms of Service</a>
              <a href="#" className={s.footerLink}>Refund Policy</a>
            </div>
          </div>
        </div>
        <div className={s.footerBottom}>
          <span className={s.footerCopy}>© {new Date().getFullYear()} FlowPay Inc. All rights reserved.</span>
          <div className={s.footerLegal}>
            <a href="#" className={s.footerLegalLink}>Privacy</a>
            <a href="#" className={s.footerLegalLink}>Terms</a>
            <a href="#" className={s.footerLegalLink}>Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
