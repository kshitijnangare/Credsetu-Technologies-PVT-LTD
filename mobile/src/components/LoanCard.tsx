import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
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

  return (
    <View style={[styles.card, overdue && styles.overdue]}>
      <View style={styles.row}>
        {image ? (
          <Image source={{ uri: image }} style={styles.receipt} />
        ) : (
          <View style={styles.placeholder} />
        )}
        <View style={styles.body}>
          <Text style={styles.name}>{loan.friendName}</Text>
          <Text style={styles.amount}>{formatCurrency(loan.amount)}</Text>
          <Text style={styles.meta}>Due {formatDate(loan.dueDate)}</Text>
        </View>
        <View style={[styles.badge, overdue && styles.badgeOverdue, repaid && styles.badgeRepaid]}>
          <Text style={[styles.badgeText, overdue && styles.badgeOverdueText]}>
            {repaid ? "Repaid" : overdue ? "Overdue" : "Pending"}
          </Text>
        </View>
      </View>
      {!repaid ? (
        <Pressable style={[styles.button, busy && styles.buttonDisabled]} onPress={() => onRepay(loan.id)} disabled={busy}>
          <Text style={styles.buttonText}>{busy ? "Updating" : "Mark repaid"}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  overdue: {
    borderLeftWidth: 3,
    borderLeftColor: colors.text,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  receipt: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: colors.background,
  },
  placeholder: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
  },
  amount: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
  },
  meta: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.background,
  },
  badgeOverdue: {
    backgroundColor: colors.text,
  },
  badgeRepaid: {
    backgroundColor: colors.canvas,
  },
  badgeText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
  },
  badgeOverdueText: {
    color: colors.canvas,
  },
  button: {
    marginTop: spacing.sm,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: colors.background,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: fonts.regular,
    color: colors.text,
  },
});
