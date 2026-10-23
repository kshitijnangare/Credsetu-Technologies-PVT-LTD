import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import React, { useMemo, useState } from "react";
import {
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
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow photo access to attach a Cloudinary receipt.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setReceiptUri(result.assets[0].uri);
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
          <Text style={styles.title}>New entry</Text>
          <Text style={styles.hint}>Receipts are uploaded to Cloudinary and stored as a URL on the loan.</Text>
          <TextInput
            style={styles.input}
            placeholder="Friend's name"
            placeholderTextColor={colors.muted}
            value={friendName}
            onChangeText={setFriendName}
          />
          <TextInput
            style={styles.input}
            placeholder="Amount"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
          <Pressable style={styles.input} onPress={() => setShowPicker(true)}>
            <Text style={styles.dateText}>Due {dueDateLabel}</Text>
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
          <Pressable style={styles.receiptButton} onPress={() => void pickReceipt()}>
            <Text style={styles.receiptText}>{receiptUri ? "Change receipt" : "Attach receipt"}</Text>
          </Pressable>
          {receiptUri ? <Image source={{ uri: receiptUri }} style={styles.preview} /> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}>
            <Pressable style={styles.secondary} onPress={onClose}>
              <Text style={styles.secondaryText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.primary} onPress={() => void handleSubmit()} disabled={submitting}>
              <Text style={styles.primaryText}>{submitting ? "Saving" : "Save"}</Text>
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
    backgroundColor: "rgba(26, 26, 26, 0.72)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
  },
  title: {
    fontFamily: fonts.regular,
    fontSize: 22,
    color: colors.text,
  },
  hint: {
    fontFamily: fonts.regular,
    color: colors.muted,
    marginTop: 6,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    marginBottom: spacing.sm,
    color: colors.text,
    fontFamily: fonts.regular,
  },
  dateText: {
    color: colors.text,
    fontFamily: fonts.regular,
  },
  receiptButton: {
    borderWidth: 1,
    borderColor: colors.muted,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  receiptText: {
    color: colors.text,
    fontFamily: fonts.regular,
  },
  preview: {
    height: 120,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  error: {
    color: colors.text,
    fontFamily: fonts.regular,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  secondary: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: "center",
    paddingVertical: 14,
  },
  secondaryText: {
    color: colors.muted,
    fontFamily: fonts.regular,
  },
  primary: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: colors.text,
    alignItems: "center",
    paddingVertical: 14,
  },
  primaryText: {
    color: colors.canvas,
    fontFamily: fonts.regular,
  },
});
