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
import { colors, spacing } from "../theme";
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
      Alert.alert("Permission needed", "Please allow photo library access to attach a receipt.");
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
      setError("Enter a valid amount greater than 0.");
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
          <Text style={styles.title}>Add loan entry</Text>
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
            <Text style={styles.dateText}>Due date: {dueDateLabel}</Text>
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
            />
          ) : null}
          <Pressable style={styles.receiptButton} onPress={pickReceipt}>
            <Text style={styles.receiptText}>{receiptUri ? "Change receipt photo" : "Attach receipt photo"}</Text>
          </Pressable>
          {receiptUri ? <Image source={{ uri: receiptUri }} style={styles.preview} /> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}>
            <Pressable style={styles.secondary} onPress={onClose}>
              <Text style={styles.secondaryText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.primary} onPress={() => void handleSubmit()} disabled={submitting}>
              <Text style={styles.primaryText}>{submitting ? "Saving..." : "Save entry"}</Text>
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
    backgroundColor: "rgba(15, 61, 62, 0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.sm,
    color: colors.text,
    backgroundColor: "#FBFEFE",
  },
  dateText: {
    color: colors.text,
    fontWeight: "600",
  },
  receiptButton: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  receiptText: {
    color: colors.accent,
    fontWeight: "700",
  },
  preview: {
    height: 120,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  secondary: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    paddingVertical: 14,
  },
  secondaryText: {
    color: colors.text,
    fontWeight: "700",
  },
  primary: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    paddingVertical: 14,
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});
