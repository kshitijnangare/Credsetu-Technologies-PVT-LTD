import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { authApi, getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { colors, spacing } from "../theme";

export const LoginScreen = () => {
  const { login } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendOtp = async () => {
    setError(null);
    if (!/^\+?[0-9]{10,15}$/.test(phoneNumber.trim())) {
      setError("Enter a valid 10-15 digit phone number.");
      return;
    }
    setLoading(true);
    try {
      await authApi.sendOtp(phoneNumber.trim());
      setOtpSent(true);
      setMessage("OTP generated. Check the backend server log, then enter it below.");
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
        <Text style={styles.title}>Track money lent to friends</Text>
        <Text style={styles.subtitle}>Sign in with your phone number. A mock OTP is printed in the server log.</Text>
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
        {message ? <Text style={styles.info}>{message}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={styles.button} onPress={() => void (otpSent ? verifyOtp() : sendOtp())} disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? "Please wait..." : otpSent ? "Verify OTP" : "Send OTP"}
          </Text>
        </Pressable>
        {otpSent ? (
          <Pressable onPress={() => setOtpSent(false)}>
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
    backgroundColor: colors.primary,
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.lg,
  },
  kicker: {
    color: colors.accent,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.primary,
  },
  subtitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    color: colors.muted,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    marginBottom: spacing.sm,
    color: colors.text,
  },
  info: {
    color: colors.accent,
    marginBottom: spacing.sm,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 14,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  link: {
    marginTop: spacing.md,
    textAlign: "center",
    color: colors.accent,
    fontWeight: "700",
  },
});
