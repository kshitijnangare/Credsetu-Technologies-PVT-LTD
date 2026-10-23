import React, { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { receiptUri } from "../api/client";
import { fonts, spacing, useTheme } from "../theme";
import type { Loan } from "../types";
import { formatCurrency, formatDate } from "../utils/format";

type Props = {
  loan: Loan;
  onRepay: (id: string) => void;
  busy?: boolean;
};

export const LoanCard = ({ loan, onRepay, busy }: Props) => {
  const { colors, isDark } = useTheme();
  const overdue = loan.overdue;
  const repaid = loan.status === "REPAID";
  const image = receiptUri(loan.receiptUrl);
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.background, borderColor: colors.border },
        overdue && { borderLeftWidth: 5, borderLeftColor: colors.primary },
      ]}
    >
      <View style={styles.row}>
        {image ? (
          <Pressable onPress={() => setModalVisible(true)}>
            <Image
              source={{ uri: image }}
              style={[styles.receipt, { backgroundColor: colors.surface, borderColor: colors.primary }]}
              resizeMode="cover"
            />
          </Pressable>
        ) : (
          <View style={[styles.placeholder, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.placeholderIcon}>🧾</Text>
          </View>
        )}

        <View style={styles.body}>
          <Text style={[styles.name, { color: colors.text }]}>{loan.friendName}</Text>
          <Text style={[styles.amount, { color: colors.primary }]}>{formatCurrency(loan.amount)}</Text>
          <Text style={[styles.meta, { color: colors.muted }]}>Due: {formatDate(loan.dueDate)}</Text>
        </View>

        <View
          style={[
            styles.badge,
            { backgroundColor: colors.surface, borderColor: colors.border },
            overdue && { backgroundColor: colors.primary },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: overdue ? colors.primaryText : colors.text },
            ]}
          >
            {repaid ? "Repaid" : overdue ? "Overdue" : "Pending"}
          </Text>
        </View>
      </View>

      {!repaid ? (
        <Pressable
          style={[styles.button, { backgroundColor: colors.primary }, busy && styles.buttonDisabled]}
          onPress={() => onRepay(loan.id)}
          disabled={busy}
        >
          <Text style={[styles.buttonText, { color: colors.primaryText }]}>
            {busy ? "Updating..." : "Mark as Repaid"}
          </Text>
        </Pressable>
      ) : null}

      {/* Fullscreen Receipt Modal */}
      {image ? (
        <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
          <View style={[styles.modalBg, { backgroundColor: colors.canvas }]}>
            <Pressable
              style={[styles.closeBtn, { backgroundColor: colors.primary }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.closeBtnText, { color: colors.primaryText }]}>✕ Close</Text>
            </Pressable>
            <Image source={{ uri: image }} style={styles.fullImage} resizeMode="contain" />
          </View>
        </Modal>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1.5,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  receipt: {
    width: 54,
    height: 54,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  placeholder: {
    width: 54,
    height: 54,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  placeholderIcon: {
    fontSize: 22,
  },
  body: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  amount: {
    marginTop: 2,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  meta: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1.5,
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  button: {
    marginTop: spacing.sm,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  modalBg: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  closeBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  closeBtnText: {
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  fullImage: {
    width: "100%",
    height: "80%",
  },
});
