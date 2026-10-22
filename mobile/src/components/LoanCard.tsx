import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { receiptUri } from "../api/client";
import { colors, spacing } from "../theme";
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

  return (
    <View style={[styles.card, overdue && styles.overdue, repaid && styles.repaid]}>
      <View style={styles.row}>
        {image ? <Image source={{ uri: image }} style={styles.receipt} /> : <View style={styles.placeholder} />}
        <View style={styles.body}>
          <Text style={styles.name}>{loan.friendName}</Text>
          <Text style={styles.amount}>{formatCurrency(loan.amount)}</Text>
          <Text style={styles.meta}>Due {formatDate(loan.dueDate)}</Text>
        </View>
        <View style={[styles.badge, repaid ? styles.badgeRepaid : overdue ? styles.badgeOverdue : styles.badgePending]}>
          <Text style={[styles.badgeText, repaid ? styles.repaidText : overdue ? styles.overdueText : styles.pendingText]}>
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
          <Text style={styles.buttonText}>Mark as repaid</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  overdue: {
    backgroundColor: "#FFF5F5",
    borderColor: "#F2B8B5",
  },
  repaid: {
    opacity: 0.9,
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
    backgroundColor: colors.primarySoft,
  },
  placeholder: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
  },
  body: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  amount: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: "800",
    color: colors.primary,
  },
  meta: {
    marginTop: 2,
    color: colors.muted,
    fontSize: 12,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgePending: {
    backgroundColor: colors.warningSoft,
  },
  badgeOverdue: {
    backgroundColor: colors.dangerSoft,
  },
  badgeRepaid: {
    backgroundColor: colors.successSoft,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  pendingText: {
    color: colors.warning,
  },
  overdueText: {
    color: colors.danger,
  },
  repaidText: {
    color: colors.success,
  },
  button: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
