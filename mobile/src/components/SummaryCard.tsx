import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme";
import type { LoanSummary } from "../types";
import { formatCurrency } from "../utils/format";

type Props = {
  summary: LoanSummary;
};

export const SummaryCard = ({ summary }: Props) => {
  return (
    <View style={styles.wrap}>
      <Metric label="Total Lent" value={summary.totalLent} tone="primary" />
      <Metric label="Total Repaid" value={summary.totalRepaid} tone="success" />
      <Metric label="Overdue" value={summary.overdueAmount} tone="danger" />
    </View>
  );
};

const Metric = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "primary" | "success" | "danger";
}) => {
  return (
    <View style={[styles.card, toneStyles[tone]]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{formatCurrency(value)}</Text>
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
    borderWidth: 1,
  },
  label: {
    fontSize: 11,
    color: colors.muted,
    marginBottom: 6,
    fontWeight: "600",
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
});

const toneStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primarySoft,
    borderColor: "#C6DEDE",
  },
  success: {
    backgroundColor: colors.successSoft,
    borderColor: "#B8E6CC",
  },
  danger: {
    backgroundColor: colors.dangerSoft,
    borderColor: "#F5C2C0",
  },
});
