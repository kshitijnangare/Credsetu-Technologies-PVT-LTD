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
      <Metric label="Total Lent" value={summary.totalLent} tone="lent" />
      <Metric label="Repaid" value={summary.totalRepaid} tone="repaid" />
      <Metric label="Overdue" value={summary.overdueAmount} tone="overdue" isOverdue={summary.overdueAmount > 0} />
    </View>
  );
};

const Metric = ({
  label,
  value,
  tone,
  isOverdue,
}: {
  label: string;
  value: number;
  tone: "lent" | "repaid" | "overdue";
  isOverdue?: boolean;
}) => {
  return (
    <View style={[styles.card, isOverdue && styles.cardOverdue]}>
      <Text style={[styles.label, isOverdue && styles.labelOverdue]}>{label}</Text>
      <Text
        style={[
          styles.value,
          tone === "lent" && styles.valueLent,
          tone === "repaid" && styles.valueRepaid,
          isOverdue && styles.valueOverdue,
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
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.sm,
    minHeight: 82,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardOverdue: {
    borderColor: "rgba(255, 123, 123, 0.4)",
    backgroundColor: "rgba(255, 123, 123, 0.08)",
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.mint,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  labelOverdue: {
    color: "#FF8E8E",
  },
  value: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.ice,
    marginTop: 6,
  },
  valueLent: {
    color: colors.ice,
  },
  valueRepaid: {
    color: colors.teal,
  },
  valueOverdue: {
    color: "#FF8E8E",
  },
});
