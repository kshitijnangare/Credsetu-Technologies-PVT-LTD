import { create } from "zustand";
import { authApi, tokenStorage } from "../api/client";
import type { AuthUser } from "../types";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  booting: boolean;
  hydrate: () => Promise<void>;
  login: (phoneNumber: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  booting: true,
  hydrate: async () => {
    const stored = await tokenStorage.get();
    set({ token: stored, booting: false });
  },
  login: async (phoneNumber, otp) => {
    const result = await authApi.verifyOtp(phoneNumber, otp);
    await tokenStorage.set(result.token);
    set({ token: result.token, user: result.user });
  },
  logout: async () => {
    await tokenStorage.clear();
    set({ token: null, user: null });
  },
}));
