import { createContext, useContext, useState, useCallback, type ReactNode, useEffect } from "react";
import { apiFetch } from "@/lib/api";

interface AMSUser {
  id: number;
  name: string;
  email: string;
  role: string;
  branch?: string;
  roll_no?: string;
  phone?: string;
  avatar?: string;
  status?: string;
}

interface AuthContextType {
  user: AMSUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, login: async () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AMSUser | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("ams_auth");
    setUser(null);
  }, []);

  const loadUser = useCallback(async () => {
    try {
      const u = await apiFetch("/api/auth/me");
      setUser(u);
    } catch (e) {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const stored = localStorage.getItem("ams_auth");
    if (stored) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string) => {
    // Login endpoint returns flat JSON: {access_token, user}
    const token = localStorage.getItem('ams_auth') ? JSON.parse(localStorage.getItem('ams_auth')!).access_token : null;
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001'}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Login failed');
    }
    
    const data = await res.json();
    // data = {access_token: "...", user: {...}}
    localStorage.setItem("ams_auth", JSON.stringify({ access_token: data.access_token, user: data.user }));
    
    // Now fetch full user profile
    try {
      const u = await apiFetch("/api/auth/me");
      setUser(u);
    } catch (e) {
      // If /me fails, use the user from login response
      setUser(data.user);
    }
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
