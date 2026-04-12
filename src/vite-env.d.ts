/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional. When set, all `/api/*` calls go to this origin (deployed FastAPI). Omit for local dev + Vite proxy. */
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID: string;
  readonly VITE_UPI_PA: string;
  readonly VITE_UPI_PN: string;
  readonly VITE_FLOWPAY_LOGO_URL?: string;
  /** Optional: attach demo checkouts to a merchant (Websites → API key). */
  readonly VITE_FLOWPAY_MERCHANT_API_KEY?: string;
  readonly VITE_FLOWPAY_MERCHANT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
