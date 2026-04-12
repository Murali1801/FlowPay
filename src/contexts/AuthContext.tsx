import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "../firebase";
import { authBootstrap, type UserProfile } from "../api";

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  getAccessToken: (forceRefresh?: boolean) => Promise<string>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function runBootstrap(user: User): Promise<UserProfile> {
  const token = await user.getIdToken();
  return authBootstrap(token);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const p = await runBootstrap(u);
          setProfile(p);
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setReady(true);
    });
    return () => unsub();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    const p = await runBootstrap(cred.user);
    setProfile(p);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const p = await runBootstrap(cred.user);
    setProfile(p);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const cred = await signInWithPopup(auth, provider);
    const p = await runBootstrap(cred.user);
    setProfile(p);
  }, []);

  const logOut = useCallback(async () => {
    await signOut(auth);
    setProfile(null);
  }, []);

  const getAccessToken = useCallback(async (forceRefresh = false) => {
    const u = auth.currentUser;
    if (!u) throw new Error("Not signed in");
    try {
      return await u.getIdToken(forceRefresh);
    } catch (e) {
      // If a background refresh fails, try one force refresh
      if (!forceRefresh) return u.getIdToken(true);
      throw e;
    }
  }, []);

  const email = profile?.email ?? "";

  const value = useMemo(
    () => ({
      user,
      profile,
      email,
      ready,
      signIn,
      signUp,
      signInWithGoogle,
      logOut,
      getAccessToken,
    }),
    [user, profile, ready, signIn, signUp, signInWithGoogle, logOut, getAccessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
