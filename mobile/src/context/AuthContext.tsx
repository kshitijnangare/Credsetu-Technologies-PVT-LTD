import React, { createContext, useContext, useEffect } from 'react';
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { axiosInstance } from '../api/client';

const TOKEN_KEY = 'miniledger_jwt_token';

// ─── 1. Define Zustand Store Types ───────────────────────────────────────────
interface AuthState {
  token: string | null;
  phoneNumber: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sendOtp: (phoneNumber: string) => Promise<{ success: boolean; message?: string }>;
  verifyOtp: (phoneNumber: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  loadToken: () => Promise<void>;
}

// ─── 2. Create Zustand Auth Store ─────────────────────────────────────────────
export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  phoneNumber: null,
  isLoading: true,
  isAuthenticated: false,

  // Load token from local storage on app boot
  loadToken: async () => {
    try {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      const storedPhone = await AsyncStorage.getItem('miniledger_phone');

      if (storedToken) {
        // Set header for all future axios requests
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        set({
          token: storedToken,
          phoneNumber: storedPhone,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false, isAuthenticated: false });
      }
    } catch (error) {
      console.error('[AuthStore] Failed to load auth token:', error);
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  // Step 1: Request Mock OTP
  sendOtp: async (phoneNumber: string) => {
    try {
      const response = await axiosInstance.post('/auth/send-otp', { phoneNumber });
      return { success: true, message: response.data?.message || 'OTP sent successfully' };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      return { success: false, message };
    }
  },

  // Step 2: Verify Mock OTP & Save Token
  verifyOtp: async (phoneNumber: string, otp: string) => {
    try {
      const response = await axiosInstance.post('/auth/verify-otp', { phoneNumber, otp });
      const { token } = response.data;

      if (token) {
        // Save token to AsyncStorage and set Axios default header
        await AsyncStorage.setItem(TOKEN_KEY, token);
        await AsyncStorage.setItem('miniledger_phone', phoneNumber);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        set({
          token,
          phoneNumber,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      }
      return { success: false, message: 'Invalid response token' };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid OTP. Please try again.';
      return { success: false, message };
    }
  },

  // Logout & Clear Token
  logout: async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem('miniledger_phone');
      delete axiosInstance.defaults.headers.common['Authorization'];

      set({
        token: null,
        phoneNumber: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('[AuthStore] Failed to logout:', error);
    }
  },
}));

// ─── 3. Auth Provider Component ───────────────────────────────────────────────
// Wraps your app root to initialize token loading when the app boots
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const loadToken = useAuthStore((state) => state.loadToken);

  useEffect(() => {
    loadToken();
  }, [loadToken]);

  return <>{children}</>;
};

// ─── 4. Custom Hook for Consuming Auth State ─────────────────────────────────
export const useAuth = () => {
  const {
    token,
    phoneNumber,
    isLoading,
    isAuthenticated,
    sendOtp,
    verifyOtp,
    logout,
  } = useAuthStore();

  return {
    token,
    phoneNumber,
    isLoading,
    isAuthenticated,
    sendOtp,
    verifyOtp,
    logout,
  };
};