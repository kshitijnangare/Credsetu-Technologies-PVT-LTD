import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, fonts, spacing } from "../theme";
import type { LoanSummary } from "../types";
import { formatCurrency } from "../utils/format";

type Props = {
  summary: LoanSummary;
};

export const SummaryCard = ({ summary }: Props) => {
  return (
    <View style={styles.wrap}>
      <Metric label="Lent" value={summary.totalLent} emphasized />
      <Metric label="Repaid" value={summary.totalRepaid} />
      <Metric label="Overdue" value={summary.overdueAmount} inverted={summary.overdueAmount > 0} />
    </View>
  );
};

const Metric = ({
  label,
  value,
  emphasized,
  inverted,
}: {
  label: string;
  value: number;
  emphasized?: boolean;
  inverted?: boolean;
}) => {
  return (
    <View style={[styles.card, inverted && styles.inverted, emphasized && !inverted && styles.emphasized]}>
      <Text style={[styles.label, inverted && styles.invertedText]}>{label}</Text>
      <Text style={[styles.value, inverted && styles.invertedText]}>{formatCurrency(value)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.sm,
    minHeight: 78,
    justifyContent: "space-between",
  },
  emphasized: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.muted,
  },
  inverted: {
    backgroundColor: colors.text,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    letterSpacing: 0.4,
  },
  value: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    marginTop: 8,
  },
  invertedText: {
    color: colors.canvas,
  },
});
