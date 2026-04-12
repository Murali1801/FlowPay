import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AlertCircle, ArrowRight, LogIn } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import s from "./AdminAuth.module.css";

function mapFirebaseError(code: string | undefined): string {
  switch (code) {
    case "auth/invalid-email": return "That email doesn't look valid.";
    case "auth/user-disabled": return "This account has been disabled.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential": return "Incorrect email or password.";
    case "auth/too-many-requests": return "Too many attempts. Try again shortly.";
    default: return "Could not sign you in. Check your details and try again.";
  }
}

const GOOGLE_SVG = (
  <svg className={s.googleLogo} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function AdminLoginPage() {
  const { signIn, signInWithGoogle, user, ready } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && user) navigate(from, { replace: true });
  }, [ready, user, navigate, from]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err && typeof err === "object" && "code" in err
        ? mapFirebaseError((err as { code?: string }).code)
        : err instanceof Error ? err.message : "Sign-in failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className={s.page}>
      {/* Left Panel */}
      <div className={s.leftPanel}>
        <div className={s.leftBrand}>
          <div className={s.leftBrandMark}>FP</div>
          <span className={s.leftBrandName}>FlowPay</span>
        </div>

        <div className={s.leftContent}>
          <div className={s.leftMockup}>
            {[
              { label: "GMV Today", value: "₹84,320", badge: "+12%" },
              { label: "Orders", value: "247" },
              { label: "Success Rate", value: "98.2%" },
            ].map((row) => (
              <div className={s.leftMockupRow} key={row.label}>
                <span className={s.leftMockupLabel}>{row.label}</span>
                <span className={s.leftMockupValue}>{row.value}</span>
                {row.badge && <span className={s.leftMockupBadge}>{row.badge}</span>}
              </div>
            ))}
          </div>
          <h2 className={s.leftTagline}>
            Your payments,{" "}
            <span className={s.leftTaglineAccent}>crystal clear.</span>
          </h2>
          <p className={s.leftDesc}>
            Track every order, monitor conversions, and manage your stores — all from one beautiful dashboard.
          </p>
          <div className={s.leftStats}>
            <div className={s.leftStat}>
              <div className={s.leftStatNum}>₹200Cr+</div>
              <div className={s.leftStatLabel}>GMV processed</div>
            </div>
            <div className={s.leftStat}>
              <div className={s.leftStatNum}>500+</div>
              <div className={s.leftStatLabel}>Active brands</div>
            </div>
          </div>
        </div>

        <div className={s.leftFooter}>© {new Date().getFullYear()} FlowPay Inc.</div>
      </div>

      {/* Right Panel */}
      <div className={s.rightPanel}>
        <div className={s.formCard}>
          <h1 className={s.formTitle}>Welcome back</h1>
          <p className={s.formSubtitle}>Sign in to your FlowPay merchant console.</p>

          {error && (
            <div className={s.formBanner}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            className={s.googleBtn}
            onClick={() => void onGoogle()}
            disabled={loading || googleLoading}
            type="button"
          >
            {googleLoading ? <div className={s.spinner} /> : GOOGLE_SVG}
            Continue with Google
          </button>

          <div className={s.formDivider}>
            <div className={s.formDividerLine} />
            <span className={s.formDividerText}>or</span>
            <div className={s.formDividerLine} />
          </div>

          <form onSubmit={(e) => void onSubmit(e)}>
            <div className={s.formGroup}>
              <label className={s.formLabel}>Email address</label>
              <input
                className={s.formInput}
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={s.formGroup}>
              <label className={s.formLabel}>Password</label>
              <input
                className={s.formInput}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className={s.formSubmit} type="submit" disabled={loading || googleLoading}>
              {loading ? <div className={s.spinner} /> : <><LogIn size={16} /> Sign in</>}
            </button>
          </form>

          <p className={s.formSwitch}>
            Don't have an account?{" "}
            <Link to="/admin/register" className={s.formSwitchLink}>
              Create one free <ArrowRight size={12} style={{ display: "inline" }} />
            </Link>
          </p>
          <p className={s.formSwitch}>
            <Link to="/" className={s.formSwitchLink}>← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
