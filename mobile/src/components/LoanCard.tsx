import React, { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { receiptUri } from "../api/client";
import { colors, fonts, spacing } from "../theme";
import type { Loan } from "../types";
import { formatCurrency, formatDate } from "../utils/format";

type Props = {
  loan: Loan;
  onRepay: (id: string) => void;
  busy?: boolean;
};

export const LoanCard = ({ loan, onRepay, busy }: Props) => {
  const overdue = loan.overdue;
  const repaid = loan.status === "REPAID";
  const image = receiptUri(loan.receiptUrl);
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={[styles.card, overdue && styles.cardOverdue]}>
      <View style={styles.row}>
        {image ? (
          <Pressable onPress={() => setModalVisible(true)}>
            <Image source={{ uri: image }} style={styles.receipt} resizeMode="cover" />
          </Pressable>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>🧾</Text>
          </View>
        )}

        <View style={styles.body}>
          <Text style={styles.name}>{loan.friendName}</Text>
          <Text style={styles.amount}>{formatCurrency(loan.amount)}</Text>
          <Text style={styles.meta}>Due: {formatDate(loan.dueDate)}</Text>
        </View>

        <View style={[styles.badge, overdue && styles.badgeOverdue, repaid && styles.badgeRepaid]}>
          <Text style={[styles.badgeText, overdue && styles.badgeOverdueText, repaid && styles.badgeRepaidText]}>
            {repaid ? "Repaid" : overdue ? "Overdue" : "Pending"}
          </Text>
        </View>
      </View>

      {!repaid ? (
        <Pressable
          style={[styles.button, busy && styles.buttonDisabled]}
          onPress={() => onRepay(loan.id)}
          disabled={busy}
        >
          <Text style={styles.buttonText}>{busy ? "Updating..." : "Mark as Repaid"}</Text>
        </Pressable>
      ) : null}

      {/* Fullscreen Receipt Modal */}
      {image ? (
        <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalBg}>
            <Pressable style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtnText}>✕ Close</Text>
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
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardOverdue: {
    borderLeftWidth: 4,
    borderLeftColor: colors.overdue,
    backgroundColor: colors.surface,
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
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.teal,
  },
  placeholder: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeholderIcon: {
    fontSize: 22,
  },
  body: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.ice,
  },
  amount: {
    marginTop: 2,
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.teal,
  },
  meta: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.mint,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "rgba(166, 214, 201, 0.12)",
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeOverdue: {
    backgroundColor: colors.overdueBg,
    borderColor: colors.overdue,
  },
  badgeRepaid: {
    backgroundColor: "rgba(76, 167, 161, 0.18)",
    borderColor: colors.teal,
  },
  badgeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.mint,
  },
  badgeOverdueText: {
    color: colors.overdue,
    fontFamily: fonts.semiBold,
  },
  badgeRepaidText: {
    color: colors.ice,
    fontFamily: fonts.semiBold,
  },
  button: {
    marginTop: spacing.sm,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.teal,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: fonts.medium,
    color: colors.ice,
    fontSize: 13,
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(11, 18, 17, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  closeBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: colors.surface,
    borderRadius: 10,
  },
  closeBtnText: {
    color: colors.ice,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  fullImage: {
    width: "100%",
    height: "80%",
  },
});
