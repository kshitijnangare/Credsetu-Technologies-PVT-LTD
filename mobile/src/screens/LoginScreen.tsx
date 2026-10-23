import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
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
      setError("Enter a valid 10-15 digit phone number.");
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
          ? "A new OTP was issued. The previous code is no longer valid."
          : "OTP generated. Check the backend log, then enter it below.",
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
      setError("OTP must be a 4-digit code.");
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
        <Text style={styles.kicker}>MiniLedger</Text>
        <Text style={styles.title}>Sign in with your phone</Text>
        <Text style={styles.subtitle}>
          A hashed mock OTP lives in Redis for a short TTL. The plaintext code is only printed in the server log.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Phone number"
          placeholderTextColor={colors.muted}
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          editable={!otpSent}
        />
        {otpSent ? (
          <TextInput
            style={styles.input}
            placeholder="4-digit OTP"
            placeholderTextColor={colors.muted}
            keyboardType="number-pad"
            maxLength={4}
            value={otp}
            onChangeText={setOtp}
          />
        ) : null}
        {otpSent ? (
          <Text style={styles.timer}>
            {ttl > 0 ? `Code expires in ${formatCountdown(ttl)}` : "Code expired. Request a new one."}
          </Text>
        ) : null}
        {message ? <Text style={styles.info}>{message}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          style={styles.button}
          onPress={() => void (otpSent ? verifyOtp() : requestOtp(false))}
          disabled={loading || (otpSent && ttl === 0)}
        >
          <Text style={styles.buttonText}>
            {loading ? "Please wait" : otpSent ? "Verify OTP" : "Send OTP"}
          </Text>
        </Pressable>
        {otpSent ? (
          <Pressable
            onPress={() => void requestOtp(true)}
            disabled={loading || ttl > 0}
            style={styles.linkWrap}
          >
            <Text style={[styles.link, ttl > 0 && styles.linkDisabled]}>
              {ttl > 0 ? `Resend available in ${formatCountdown(ttl)}` : "Resend OTP"}
            </Text>
          </Pressable>
        ) : null}
        {otpSent ? (
          <Pressable
            onPress={() => {
              setOtpSent(false);
              setOtp("");
              setTtl(0);
              setMessage(null);
            }}
          >
            <Text style={styles.link}>Use a different number</Text>
          </Pressable>
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
  },
  kicker: {
    fontFamily: fonts.regular,
    color: colors.muted,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.regular,
    fontSize: 28,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.regular,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    color: colors.muted,
    lineHeight: 20,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    marginBottom: spacing.sm,
    color: colors.text,
    fontFamily: fonts.regular,
  },
  timer: {
    fontFamily: fonts.regular,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  info: {
    fontFamily: fonts.regular,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  error: {
    fontFamily: fonts.regular,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  button: {
    backgroundColor: colors.text,
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 14,
  },
  buttonText: {
    color: colors.canvas,
    fontFamily: fonts.regular,
  },
  linkWrap: {
    marginTop: spacing.md,
  },
  link: {
    fontFamily: fonts.regular,
    textAlign: "center",
    color: colors.text,
  },
  linkDisabled: {
    color: colors.muted,
  },
});
