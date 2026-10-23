import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError } from "axios";
import { Platform } from "react-native";
import type { AuthUser, Loan, LoanAnalytics, LoanSummary } from "../types";

const TOKEN_KEY = "miniledger.token";

const defaultHost = Platform.OS === "android" ? "10.0.2.2" : "localhost";

export const API_ORIGIN =
  process.env.EXPO_PUBLIC_API_ORIGIN ?? `http://${defaultHost}:4000`;

export const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  timeout: 20000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;
    if (typeof message === "string") {
      return message;
    }
    const details = error.response?.data?.details;
    if (Array.isArray(details) && details[0]?.message) {
      return String(details[0].message);
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
};

export const authApi = {
  sendOtp: async (phoneNumber: string): Promise<{ expiresInSeconds: number }> => {
    const { data } = await api.post<{ expiresInSeconds: number }>("/auth/send-otp", { phoneNumber });
    return data;
  },
  resendOtp: async (phoneNumber: string): Promise<{ expiresInSeconds: number }> => {
    const { data } = await api.post<{ expiresInSeconds: number }>("/auth/resend-otp", { phoneNumber });
    return data;
  },
  otpStatus: async (phoneNumber: string): Promise<{ ttlSeconds: number; canResend: boolean }> => {
    const { data } = await api.get<{ ttlSeconds: number; canResend: boolean }>("/auth/otp-status", {
      params: { phoneNumber },
    });
    return data;
  },
  verifyOtp: async (
    phoneNumber: string,
    otp: string,
  ): Promise<{ token: string; user: AuthUser }> => {
    const { data } = await api.post<{ token: string; user: AuthUser }>("/auth/verify-otp", {
      phoneNumber,
      otp,
    });
    return data;
  },
};

export const loanApi = {
  list: async (): Promise<Loan[]> => {
    const { data } = await api.get<Loan[]>("/loans");
    return data;
  },
  summary: async (): Promise<LoanSummary> => {
    const { data } = await api.get<LoanSummary>("/loans/summary");
    return data;
  },
  analytics: async (): Promise<LoanAnalytics> => {
    const { data } = await api.get<LoanAnalytics>("/loans/analytics");
    return data;
  },
  create: async (payload: {
    friendName: string;
    amount: string;
    dueDate: string;
    receiptUri?: string | null;
  }): Promise<Loan> => {
    const form = new FormData();
    form.append("friendName", payload.friendName);
    form.append("amount", payload.amount);
    form.append("dueDate", payload.dueDate);
    if (payload.receiptUri) {
      const name = payload.receiptUri.split("/").pop() ?? "receipt.jpg";
      form.append("receipt", {
        uri: payload.receiptUri,
        name,
        type: name.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg",
      } as unknown as Blob);
    }
    const { data } = await api.post<Loan>("/loans", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  repay: async (id: string): Promise<Loan> => {
    const { data } = await api.patch<Loan>(`/loans/${id}/repay`);
    return data;
  },
};

export const tokenStorage = {
  key: TOKEN_KEY,
  get: () => AsyncStorage.getItem(TOKEN_KEY),
  set: (token: string) => AsyncStorage.setItem(TOKEN_KEY, token),
  clear: () => AsyncStorage.removeItem(TOKEN_KEY),
};

export const receiptUri = (path: string | null): string | null => {
  if (!path) {
    return null;
  }
  if (path.startsWith("http")) {
    return path;
  }
  return `${API_ORIGIN}${path}`;
};
