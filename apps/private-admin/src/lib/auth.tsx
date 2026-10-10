import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth";
import { getAdminAuth, isAdminFirebaseConfigured } from "@/lib/firebase";
import { setTokenProvider } from "@/lib/api";

interface AdminAuthState {
  user: User | null;
  loading: boolean;
  configured: boolean;
  /** True only when the ID token carries the server-set `admin` claim. */
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  sendReset: (email: string) => Promise<void>;
  /** Force-refresh the ID token, e.g. before a higher-risk action. */
  refreshToken: () => Promise<string | null>;
  error: string | null;
  clearError: () => void;
}

const AdminAuthContext = createContext<AdminAuthState | null>(null);

function claimsIndicateAdmin(user: User | null): boolean {
  if (!user) return false;
  // The Firebase SDK does not decode custom claims directly; we inspect the
  // cached token result claims synchronously via a helper populated below.
  return (user as unknown as { __adminClaim?: boolean }).__adminClaim === true;
}

/** Map Firebase auth error codes to safe, non-enumerating messages. */
function safeAuthMessage(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "The email address or password is incorrect.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Sign-in failed. Please try again.";
  }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const configured = isAdminFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(configured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!configured) return;
    const auth = getAdminAuth();
    const unsubscribe = onIdTokenChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        const result = await nextUser.getIdTokenResult();
        const admin = result.claims.admin === true;
        // Attach a synchronous marker so claims-aware helpers can read it.
        (nextUser as unknown as { __adminClaim?: boolean }).__adminClaim = admin;
        setIsAdmin(admin);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [configured]);

  // Keep the API token provider pointed at the freshest ID token.
  useEffect(() => {
    if (!configured) {
      setTokenProvider(async () => null);
      return;
    }
    setTokenProvider(async () => {
      const current = getAdminAuth().currentUser;
      if (!current) return null;
      return current.getIdToken();
    });
  }, [configured, user]);

  const value = useMemo<AdminAuthState>(
    () => ({
      user,
      loading,
      configured,
      isAdmin,
      error,
      clearError: () => setError(null),
      async signIn(email, password) {
        setError(null);
        try {
          await signInWithEmailAndPassword(getAdminAuth(), email, password);
        } catch (err) {
          const code = (err as { code?: string }).code ?? "auth/unknown";
          setError(safeAuthMessage(code));
          throw err;
        }
      },
      async signOutUser() {
        await signOut(getAdminAuth());
        setIsAdmin(false);
      },
      async sendReset(email) {
        setError(null);
        try {
          await sendPasswordResetEmail(getAdminAuth(), email);
        } catch {
          // Always report success to avoid account enumeration.
        }
      },
      async refreshToken() {
        const current = getAdminAuth().currentUser;
        if (!current) return null;
        return current.getIdToken(true);
      },
    }),
    [user, loading, configured, isAdmin, error],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthState {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return context;
}

export { claimsIndicateAdmin };
