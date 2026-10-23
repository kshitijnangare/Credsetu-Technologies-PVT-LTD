import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { fonts, spacing, useTheme } from "../theme";
import type { LoanSummary } from "../types";
import { formatCurrency } from "../utils/format";

type Props = {
  summary: LoanSummary;
};

export const SummaryCard = ({ summary }: Props) => {
  return (
    <View style={styles.wrap}>
      <Metric label="Total Lent" value={summary.totalLent} />
      <Metric label="Repaid" value={summary.totalRepaid} isRepaid />
      <Metric label="Overdue" value={summary.overdueAmount} isOverdue={summary.overdueAmount > 0} />
    </View>
  );
};

const Metric = ({
  label,
  value,
  isOverdue,
  isRepaid,
}: {
  label: string;
  value: number;
  isOverdue?: boolean;
  isRepaid?: boolean;
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.background, borderColor: colors.border },
        isOverdue && { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.surface },
      ]}
    >
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      <Text
        style={[
          styles.value,
          { color: colors.text },
          isRepaid && { color: colors.primary },
          isOverdue && { color: colors.primary, textDecorationLine: "underline" },
        ]}
      >
        {formatCurrency(value)}
      </Text>
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
    borderRadius: 16,
    padding: spacing.sm,
    minHeight: 82,
    justifyContent: "space-between",
    borderWidth: 1.5,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  value: {
    fontFamily: fonts.bold,
    fontSize: 16,
    marginTop: 6,
  },
});
