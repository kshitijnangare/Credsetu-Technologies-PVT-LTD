import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi, tokenStorage } from "../api/client";
import type { AuthUser } from "../types";

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  booting: boolean;
  login: (phoneNumber: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const restore = async () => {
      const stored = await tokenStorage.get();
      setToken(stored);
      setBooting(false);
    };
    void restore();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      booting,
      login: async (phoneNumber, otp) => {
        const result = await authApi.verifyOtp(phoneNumber, otp);
        await tokenStorage.set(result.token);
        setToken(result.token);
        setUser(result.user);
      },
      logout: async () => {
        await tokenStorage.clear();
        setToken(null);
        setUser(null);
      },
    }),
    [token, user, booting],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
