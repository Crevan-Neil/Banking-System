"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { authApi } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("bank_token");
    const savedUser = localStorage.getItem("bank_user");
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("bank_token");
        localStorage.removeItem("bank_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const { data, error } = await authApi.login({ email, password });
      if (error) return error;
      if (data) {
        const u = { id: data.user.id, email: data.user.email, name: data.user.name };
        setUser(u);
        setToken(data.token);
        localStorage.setItem("bank_token", data.token);
        localStorage.setItem("bank_user", JSON.stringify(u));
      }
      return null;
    },
    []
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string
    ): Promise<string | null> => {
      const { data, error } = await authApi.register({ name, email, password });
      if (error) return error;
      if (data) {
        const u = {
          id: data.user._id,
          email: data.user.email,
          name: data.user.name,
        };
        setUser(u);
        setToken(data.token);
        localStorage.setItem("bank_token", data.token);
        localStorage.setItem("bank_user", JSON.stringify(u));
      }
      return null;
    },
    []
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setToken(null);
    localStorage.removeItem("bank_token");
    localStorage.removeItem("bank_user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
