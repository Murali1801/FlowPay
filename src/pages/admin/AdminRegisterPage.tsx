import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, UserPlus } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import s from "./AdminAuth.module.css";

function mapFirebaseError(code: string | undefined): string {
  switch (code) {
    case "auth/email-already-in-use": return "That email is already registered. Try signing in.";
    case "auth/invalid-email": return "That email doesn't look valid.";
    case "auth/weak-password": return "Choose a stronger password (min 6 characters).";
    default: return "Could not create your account. Try again.";
  }
}

const GOOGLE_SVG = (
  <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function AdminRegisterPage() {
  const { signUp, signInWithGoogle, user, ready } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && user) navigate("/admin/dashboard", { replace: true });
  }, [ready, user, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) { setError("Password should be at least 6 characters."); return; }
    setLoading(true);
    try {
      await signUp(email, password);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      const msg = err && typeof err === "object" && "code" in err
        ? mapFirebaseError((err as { code?: string }).code)
        : err instanceof Error ? err.message : "Registration failed";
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
      navigate("/admin/dashboard", { replace: true });
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
              { label: "Setup time", value: "< 10 min" },
              { label: "Transaction fee", value: "1.5%" },
              { label: "Settlement speed", value: "Instant" },
            ].map((row) => (
              <div className={s.leftMockupRow} key={row.label}>
                <span className={s.leftMockupLabel}>{row.label}</span>
                <span className={s.leftMockupValue}>{row.value}</span>
              </div>
            ))}
          </div>
          <h2 className={s.leftTagline}>
            Launch your{" "}
            <span className={s.leftTaglineAccent}>checkout in minutes.</span>
          </h2>
          <p className={s.leftDesc}>
            Create your free FlowPay account, add a storefront, and start accepting UPI payments — no code required.
          </p>
          <div className={s.leftStats}>
            <div className={s.leftStat}>
              <div className={s.leftStatNum}>Free</div>
              <div className={s.leftStatLabel}>To get started</div>
            </div>
            <div className={s.leftStat}>
              <div className={s.leftStatNum}>1 API</div>
              <div className={s.leftStatLabel}>call to go live</div>
            </div>
          </div>
        </div>

        <div className={s.leftFooter}>© {new Date().getFullYear()} FlowPay Inc.</div>
      </div>

      {/* Right Panel */}
      <div className={s.rightPanel}>
        <div className={s.formCard}>
          <h1 className={s.formTitle}>Create your account</h1>
          <p className={s.formSubtitle}>Start accepting payments in minutes. No credit card required.</p>

          {error && (
            <div className={s.formBanner}>
              <AlertCircle size={16} /> {error}
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
                autoComplete="new-password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button className={s.formSubmit} type="submit" disabled={loading || googleLoading}>
              {loading ? <div className={s.spinner} /> : <><UserPlus size={16} /> Create account</>}
            </button>
          </form>

          <p className={s.formSwitch} style={{ fontSize: "0.8rem", color: "var(--text-4)", marginTop: 12 }}>
            By signing up you agree to our{" "}
            <a href="#" className={s.formSwitchLink}>Terms of Service</a> and{" "}
            <a href="#" className={s.formSwitchLink}>Privacy Policy</a>.
          </p>

          <p className={s.formSwitch}>
            Already have an account?{" "}
            <Link to="/admin/login" className={s.formSwitchLink}>
              Sign in <ArrowRight size={12} style={{ display: "inline" }} />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
