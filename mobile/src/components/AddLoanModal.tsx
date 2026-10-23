import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { fonts, spacing, useTheme } from "../theme";
import { toIsoDate } from "../utils/format";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    friendName: string;
    amount: string;
    dueDate: string;
    receiptUri?: string | null;
  }) => Promise<void>;
};

export const AddLoanModal = ({ visible, onClose, onSubmit }: Props) => {
  const { colors, isDark } = useTheme();
  const [friendName, setFriendName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dueDateLabel = useMemo(() => toIsoDate(dueDate), [dueDate]);

  const reset = () => {
    setFriendName("");
    setAmount("");
    setDueDate(new Date());
    setReceiptUri(null);
    setError(null);
  };

  const pickReceipt = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Please grant photo library access to upload a receipt.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setReceiptUri(result.assets[0].uri);
      }
    } catch (pickerErr) {
      Alert.alert("Image error", "Could not select the image. Please try again.");
    }
  };

  const handleSubmit = async () => {
    const name = friendName.trim();
    const parsedAmount = Number(amount);
    if (name.length < 2) {
      setError("Enter a friend's name with at least 2 characters.");
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        friendName: name,
        amount: String(parsedAmount),
        dueDate: dueDateLabel,
        receiptUri,
      });
      reset();
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not save this loan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: isDark ? "rgba(11, 18, 17, 0.8)" : "rgba(76, 167, 161, 0.4)" }]}>
        <View style={[styles.sheet, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>New Loan Entry</Text>
          <Text style={[styles.hint, { color: colors.muted }]}>Track money lent and keep an optional receipt photo.</Text>

          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="Friend's Name"
            placeholderTextColor={colors.muted}
            value={friendName}
            onChangeText={setFriendName}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="Amount (₹)"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />

          <Pressable
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowPicker(true)}
          >
            <Text style={[styles.dateText, { color: colors.text }]}>📅 Due Date: {dueDateLabel}</Text>
          </Pressable>

          {showPicker ? (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_event, selected) => {
                setShowPicker(Platform.OS === "ios");
                if (selected) {
                  setDueDate(selected);
                }
              }}
              themeVariant={isDark ? "dark" : "light"}
            />
          ) : null}

          {/* Receipt Selection & Preview */}
          {receiptUri ? (
            <View style={[styles.previewBox, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
              <Image
                source={{ uri: receiptUri }}
                style={styles.previewImg}
                resizeMode="cover"
              />
              <View style={styles.previewOverlay}>
                <Pressable
                  style={[styles.changeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => void pickReceipt()}
                >
                  <Text style={[styles.changeBtnText, { color: colors.text }]}>Change</Text>
                </Pressable>
                <Pressable
                  style={[styles.removeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => setReceiptUri(null)}
                >
                  <Text style={[styles.removeBtnText, { color: colors.primary }]}>✕ Remove</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              style={[styles.receiptButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => void pickReceipt()}
            >
              <Text style={[styles.receiptText, { color: colors.text }]}>📎 Attach Receipt Photo</Text>
            </Pressable>
          )}

          {error ? <Text style={[styles.error, { color: colors.primary }]}>{error}</Text> : null}

          <View style={styles.actions}>
            <Pressable
              style={[styles.secondary, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={onClose}
              disabled={submitting}
            >
              <Text style={[styles.secondaryText, { color: colors.text }]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.primary, { backgroundColor: colors.primary }]}
              onPress={() => void handleSubmit()}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={colors.primaryText} size="small" />
              ) : (
                <Text style={[styles.primaryText, { color: colors.primaryText }]}>Save Loan</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.lg,
    borderWidth: 2,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 22,
  },
  hint: {
    fontFamily: fonts.medium,
    marginTop: 4,
    marginBottom: spacing.md,
    fontSize: 13,
  },
  input: {
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    marginBottom: spacing.sm,
    fontFamily: fonts.medium,
    borderWidth: 1.5,
  },
  dateText: {
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  receiptButton: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  receiptText: {
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  previewBox: {
    width: "100%",
    height: 150,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: spacing.sm,
    borderWidth: 2,
    position: "relative",
  },
  previewImg: {
    width: "100%",
    height: "100%",
  },
  previewOverlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    flexDirection: "row",
    gap: 8,
  },
  changeBtn: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1.5,
  },
  changeBtnText: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  removeBtn: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1.5,
  },
  removeBtnText: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  error: {
    fontFamily: fonts.bold,
    fontSize: 13,
    marginBottom: spacing.sm,
    textDecorationLine: "underline",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  secondary: {
    flex: 1,
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 14,
    borderWidth: 1.5,
  },
  secondaryText: {
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  primary: {
    flex: 1,
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 14,
  },
  primaryText: {
    fontFamily: fonts.bold,
    fontSize: 14,
  },
});
