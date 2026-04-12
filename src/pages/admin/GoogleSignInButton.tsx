import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import s from "./AdminAuth.module.css";

type Props = {
  onSuccess?: () => void;
  onError: (message: string) => void;
  disabled?: boolean;
};

export default function GoogleSignInButton({ onSuccess, onError, disabled }: Props) {
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    onError("");
    setBusy(true);
    try {
      await signInWithGoogle();
      onSuccess?.();
    } catch (err) {
      onError(mapGoogleError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className={s.googleBtn}
      disabled={disabled || busy}
      onClick={() => void handleClick()}
      aria-label="Continue with Google"
    >
      <GoogleMark aria-hidden />
      {busy ? "Opening Google…" : "Continue with Google"}
    </button>
  );
}

function GoogleMark({ "aria-hidden": ariaHidden }: { "aria-hidden"?: boolean }) {
  return (
    <svg
      className={s.googleMark}
      viewBox="0 0 48 48"
      width={20}
      height={20}
      aria-hidden={ariaHidden}
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

function mapGoogleError(err: unknown): string {
  if (err && typeof err === "object" && "code" in err) {
    const code = (err as { code?: string }).code;
    switch (code) {
      case "auth/popup-closed-by-user":
      case "auth/cancelled-popup-request":
        return "Sign-in was cancelled.";
      case "auth/popup-blocked":
        return "Pop-up was blocked. Allow pop-ups for this site and try again.";
      case "auth/account-exists-with-different-credential":
        return "An account already exists with this email using a different sign-in method.";
      case "auth/network-request-failed":
        return "Network error. Check your connection and try again.";
      default:
        break;
    }
  }
  if (err instanceof Error && err.message) return err.message;
  return "Google sign-in failed. Try again.";
}
