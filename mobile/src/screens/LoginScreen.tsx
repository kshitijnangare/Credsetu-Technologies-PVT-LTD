import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { authApi, getErrorMessage } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { colors, fonts, spacing } from "../theme";
import { formatCountdown } from "../utils/format";

export const LoginScreen = () => {
  const login = useAuthStore((state) => state.login);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [ttl, setTtl] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ttl <= 0) {
      return;
    }
    const timer = setInterval(() => {
      setTtl((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [ttl]);

  const requestOtp = async (resend: boolean) => {
    setError(null);
    if (!/^\+?[0-9]{10,15}$/.test(phoneNumber.trim())) {
      setError("Please enter a valid 10-15 digit phone number.");
      return;
    }
    setLoading(true);
    try {
      const result = resend
        ? await authApi.resendOtp(phoneNumber.trim())
        : await authApi.sendOtp(phoneNumber.trim());
      setOtpSent(true);
      setTtl(result.expiresInSeconds);
      setMessage(
        resend
          ? "A new OTP was issued. The previous code has expired."
          : "Mock OTP generated! Check your backend server console.",
      );
    } catch (sendError) {
      setError(getErrorMessage(sendError));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError(null);
    if (!/^\d{4}$/.test(otp.trim())) {
      setError("Please enter the 4-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      await login(phoneNumber.trim(), otp.trim());
    } catch (verifyError) {
      setError(getErrorMessage(verifyError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.card}>
        <Text style={styles.kicker}>MINILEDGER</Text>
        <Text style={styles.title}>Sign in with Phone</Text>
        <Text style={styles.subtitle}>
          Secure passwordless authentication. Mock OTP is hashed in Redis Cloud with automated TTL expiration.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Phone Number (e.g. 9876543210)"
          placeholderTextColor={colors.muted}
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          editable={!otpSent}
        />

        {otpSent ? (
          <TextInput
            style={[styles.input, styles.otpInput]}
            placeholder="4-digit OTP"
            placeholderTextColor={colors.muted}
            keyboardType="number-pad"
            maxLength={4}
            value={otp}
            onChangeText={setOtp}
            autoFocus
          />
        ) : null}

        {otpSent ? (
          <View style={styles.timerRow}>
            <Text style={styles.timer}>
              {ttl > 0 ? `Code expires in: ${formatCountdown(ttl)}` : "⚠️ Code expired. Please request a new one."}
            </Text>
          </View>
        ) : null}

        {message ? <Text style={styles.info}>{message}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.button, (loading || (otpSent && ttl === 0)) && styles.buttonDisabled]}
          onPress={() => void (otpSent ? verifyOtp() : requestOtp(false))}
          disabled={loading || (otpSent && ttl === 0)}
        >
          {loading ? (
            <ActivityIndicator color={colors.primaryDark} size="small" />
          ) : (
            <Text style={styles.buttonText}>{otpSent ? "Verify & Enter" : "Send Mock OTP"}</Text>
          )}
        </Pressable>

        {otpSent ? (
          <View style={styles.links}>
            <Pressable
              onPress={() => void requestOtp(true)}
              disabled={loading || ttl > 0}
              style={styles.linkWrap}
            >
              <Text style={[styles.link, ttl > 0 && styles.linkDisabled]}>
                {ttl > 0 ? `Resend available in ${formatCountdown(ttl)}` : "🔄 Resend OTP"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setOtpSent(false);
                setOtp("");
                setTtl(0);
                setMessage(null);
                setError(null);
              }}
              style={styles.linkWrap}
            >
              <Text style={styles.linkSecondary}>Use a different number</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kicker: {
    fontFamily: fonts.semiBold,
    color: colors.teal,
    letterSpacing: 2,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: colors.ice,
  },
  subtitle: {
    fontFamily: fonts.regular,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    color: colors.mint,
    lineHeight: 20,
    fontSize: 13,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    marginBottom: spacing.sm,
    color: colors.ice,
    fontFamily: fonts.regular,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
  },
  otpInput: {
    letterSpacing: 4,
    fontSize: 18,
    fontFamily: fonts.semiBold,
    borderColor: colors.teal,
  },
  timerRow: {
    marginBottom: spacing.sm,
  },
  timer: {
    fontFamily: fonts.medium,
    color: colors.mint,
    fontSize: 13,
  },
  info: {
    fontFamily: fonts.medium,
    color: colors.teal,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  error: {
    fontFamily: fonts.medium,
    color: "#FF8E8E",
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  button: {
    backgroundColor: colors.teal,
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 14,
    marginTop: spacing.xs,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.canvas,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  links: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  linkWrap: {
    paddingVertical: 4,
  },
  link: {
    fontFamily: fonts.medium,
    textAlign: "center",
    color: colors.ice,
    fontSize: 13,
  },
  linkDisabled: {
    color: colors.mint,
    opacity: 0.6,
  },
  linkSecondary: {
    fontFamily: fonts.regular,
    textAlign: "center",
    color: colors.mint,
    fontSize: 12,
  },
});
