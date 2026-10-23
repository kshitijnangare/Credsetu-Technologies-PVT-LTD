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
import { colors, fonts, spacing } from "../theme";
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
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>New Loan Entry</Text>
          <Text style={styles.hint}>Track money lent and keep an optional receipt photo.</Text>

          <TextInput
            style={styles.input}
            placeholder="Friend's Name"
            placeholderTextColor={colors.muted}
            value={friendName}
            onChangeText={setFriendName}
          />
          <TextInput
            style={styles.input}
            placeholder="Amount (₹)"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />

          <Pressable style={styles.input} onPress={() => setShowPicker(true)}>
            <Text style={styles.dateText}>📅 Due Date: {dueDateLabel}</Text>
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
              themeVariant="dark"
            />
          ) : null}

          {/* Receipt Selection & Preview */}
          {receiptUri ? (
            <View style={styles.previewBox}>
              <Image
                source={{ uri: receiptUri }}
                style={styles.previewImg}
                resizeMode="cover"
              />
              <View style={styles.previewOverlay}>
                <Pressable style={styles.changeBtn} onPress={() => void pickReceipt()}>
                  <Text style={styles.changeBtnText}>Change</Text>
                </Pressable>
                <Pressable style={styles.removeBtn} onPress={() => setReceiptUri(null)}>
                  <Text style={styles.removeBtnText}>✕ Remove</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable style={styles.receiptButton} onPress={() => void pickReceipt()}>
              <Text style={styles.receiptText}>📎 Attach Receipt Photo</Text>
            </Pressable>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <Pressable style={styles.secondary} onPress={onClose} disabled={submitting}>
              <Text style={styles.secondaryText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.primary} onPress={() => void handleSubmit()} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color={colors.primaryDark} size="small" />
              ) : (
                <Text style={styles.primaryText}>Save Loan</Text>
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
    backgroundColor: "rgba(11, 18, 17, 0.75)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.ice,
  },
  hint: {
    fontFamily: fonts.regular,
    color: colors.mint,
    marginTop: 4,
    marginBottom: spacing.md,
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
  },
  dateText: {
    color: colors.ice,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  receiptButton: {
    borderWidth: 1,
    borderColor: colors.teal,
    borderStyle: "dashed",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: spacing.sm,
    backgroundColor: "rgba(76, 167, 161, 0.08)",
  },
  receiptText: {
    color: colors.ice,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  previewBox: {
    width: "100%",
    height: 150,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.teal,
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
    backgroundColor: "rgba(18, 28, 27, 0.85)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.mint,
  },
  changeBtnText: {
    color: colors.ice,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  removeBtn: {
    backgroundColor: "rgba(18, 28, 27, 0.85)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 123, 123, 0.5)",
  },
  removeBtnText: {
    color: "#FF8E8E",
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  error: {
    color: "#FF8E8E",
    fontFamily: fonts.regular,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  secondary: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: "center",
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: {
    color: colors.mint,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  primary: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: colors.teal,
    alignItems: "center",
    paddingVertical: 14,
  },
  primaryText: {
    color: colors.canvas,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
});
