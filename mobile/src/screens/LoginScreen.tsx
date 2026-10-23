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
import { fonts, spacing, useTheme } from "../theme";
import { formatCountdown } from "../utils/format";

export const LoginScreen = () => {
  const login = useAuthStore((state) => state.login);
  const { colors, isDark, toggleTheme } = useTheme();
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
          ? "A new OTP was issued. Previous code has expired."
          : "Mock OTP generated! Check server console log.",
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
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.canvas }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <View style={styles.topRow}>
          <Text style={[styles.kicker, { color: colors.primary }]}>MINILEDGER</Text>
          <Pressable
            style={[styles.themeChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={toggleTheme}
          >
            <Text style={styles.themeChipText}>{isDark ? "☀️ Light" : "🌙 Dark"}</Text>
          </Pressable>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Sign in with Phone</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Secure passwordless authentication. Mock OTP is hashed in Redis Cloud with automated TTL expiration.
        </Text>

        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          placeholder="Phone Number (e.g. 9876543210)"
          placeholderTextColor={colors.muted}
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          editable={!otpSent}
        />

        {otpSent ? (
          <TextInput
            style={[styles.input, styles.otpInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
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
            <Text style={[styles.timer, { color: colors.muted }]}>
              {ttl > 0 ? `Code expires in: ${formatCountdown(ttl)}` : "Code expired. Request a new one."}
            </Text>
          </View>
        ) : null}

        {message ? <Text style={[styles.info, { color: colors.primary }]}>{message}</Text> : null}
        {error ? <Text style={[styles.error, { color: colors.primary }]}>{error}</Text> : null}

        <Pressable
          style={[styles.button, { backgroundColor: colors.primary }, (loading || (otpSent && ttl === 0)) && styles.buttonDisabled]}
          onPress={() => void (otpSent ? verifyOtp() : requestOtp(false))}
          disabled={loading || (otpSent && ttl === 0)}
        >
          {loading ? (
            <ActivityIndicator color={colors.primaryText} size="small" />
          ) : (
            <Text style={[styles.buttonText, { color: colors.primaryText }]}>
              {otpSent ? "Verify & Enter" : "Send Mock OTP"}
            </Text>
          )}
        </Pressable>

        {otpSent ? (
          <View style={styles.links}>
            <Pressable
              onPress={() => void requestOtp(true)}
              disabled={loading || ttl > 0}
              style={styles.linkWrap}
            >
              <Text style={[styles.link, { color: colors.text }, ttl > 0 && styles.linkDisabled]}>
                {ttl > 0 ? `Resend available in ${formatCountdown(ttl)}` : "Resend OTP"}
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
              <Text style={[styles.linkSecondary, { color: colors.muted }]}>Use a different number</Text>
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
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  kicker: {
    fontFamily: fonts.bold,
    letterSpacing: 2,
    fontSize: 12,
  },
  themeChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  themeChipText: {
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 26,
  },
  subtitle: {
    fontFamily: fonts.regular,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    lineHeight: 20,
    fontSize: 13,
  },
  input: {
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    marginBottom: spacing.sm,
    fontFamily: fonts.medium,
    borderWidth: 1.5,
    fontSize: 15,
  },
  otpInput: {
    letterSpacing: 4,
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  timerRow: {
    marginBottom: spacing.sm,
  },
  timer: {
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  info: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  error: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    marginBottom: spacing.sm,
    textDecorationLine: "underline",
  },
  button: {
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 14,
    marginTop: spacing.xs,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
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
    fontFamily: fonts.bold,
    textAlign: "center",
    fontSize: 13,
  },
  linkDisabled: {
    opacity: 0.5,
  },
  linkSecondary: {
    fontFamily: fonts.medium,
    textAlign: "center",
    fontSize: 12,
  },
});
