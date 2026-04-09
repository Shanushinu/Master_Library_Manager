import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

interface AuthUser {
  userId: number;
  email: string;
  name: string;
  role: string;
  token: string;
  refreshToken?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  isAdmin: boolean;
  isLibrarian: boolean;
  isFaculty: boolean;
  isStaff: boolean;
  isStudent: boolean;
  isMember: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "lms_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    setAuthTokenGetter(() => user?.token ?? null);
  }, [user]);

  const login = (u: AuthUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const role = user?.role ?? "";

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAdmin: role === "ROLE_ADMIN",
      isLibrarian: role === "ROLE_LIBRARIAN",
      isFaculty: role === "ROLE_FACULTY",
      isStaff: role === "ROLE_ADMIN" || role === "ROLE_LIBRARIAN",
      isStudent: role === "ROLE_STUDENT" || role === "ROLE_COLLEGE_STUDENT" || role === "ROLE_SCHOOL_STUDENT",
      isMember: role === "ROLE_MEMBER" || role === "ROLE_GENERAL_PATRON",
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
