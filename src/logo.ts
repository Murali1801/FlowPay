/** Default: hosted logo. Override with `VITE_FLOWPAY_LOGO_URL` in `.env`. */
export const FLOWPAY_LOGO_URL =
  (import.meta.env.VITE_FLOWPAY_LOGO_URL as string | undefined)?.trim() ||
  "/logo.png";
