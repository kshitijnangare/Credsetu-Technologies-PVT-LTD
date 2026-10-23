import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getErrorMessage } from "../api/client";
import { AddLoanModal } from "../components/AddLoanModal";
import { LoanCard } from "../components/LoanCard";
import { Sidebar } from "../components/Sidebar";
import { SummaryCard } from "../components/SummaryCard";
import { useLoanStore } from "../store/loanStore";
import { useUiStore } from "../store/uiStore";
import { colors, fonts, spacing } from "../theme";

export const DashboardScreen = () => {
  const openSidebar = useUiStore((state) => state.openSidebar);
  const { loans, summary, loading, error, loadDashboard, createLoan, repayLoan } = useLoanStore();
  const [addOpen, setAddOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [repayingId, setRepayingId] = useState<string | null>(null);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const refresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const repay = async (id: string) => {
    setRepayingId(id);
    try {
      await repayLoan(id);
    } catch (repayError) {
      Alert.alert("Could not update loan", getErrorMessage(repayError));
    } finally {
      setRepayingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable style={styles.menuButton} onPress={openSidebar}>
          <Text style={styles.menuIcon}>☰</Text>
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.kicker}>MINILEDGER</Text>
          <Text style={styles.title}>Loans</Text>
        </View>
        <Pressable style={styles.addChip} onPress={() => setAddOpen(true)}>
          <Text style={styles.addChipText}>+ New</Text>
        </Pressable>
      </View>

      {loading && loans.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.teal} size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void refresh()}
              tintColor={colors.teal}
            />
          }
        >
          <SummaryCard summary={summary} />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.sectionRow}>
            <Text style={styles.section}>All Entries</Text>
            <Text style={styles.countBadge}>{loans.length}</Text>
          </View>

          {loans.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>💸</Text>
              <Text style={styles.emptyTitle}>No loans recorded yet</Text>
              <Text style={styles.emptyText}>Tap "+ New" above to record money lent with an optional receipt.</Text>
            </View>
          ) : (
            loans.map((loan) => (
              <LoanCard
                key={loan.id}
                loan={loan}
                onRepay={(id) => void repay(id)}
                busy={repayingId === loan.id}
              />
            ))
          )}
        </ScrollView>
      )}

      <Sidebar />
      <AddLoanModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={async (payload) => {
          try {
            await createLoan(payload);
          } catch (createError) {
            throw new Error(getErrorMessage(createError));
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuIcon: {
    color: colors.ice,
    fontSize: 20,
  },
  headerCopy: {
    flex: 1,
  },
  kicker: {
    fontFamily: fonts.semiBold,
    color: colors.teal,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.ice,
  },
  addChip: {
    backgroundColor: colors.teal,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addChipText: {
    color: colors.canvas,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 48,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  section: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.mint,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  countBadge: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.teal,
    backgroundColor: "rgba(76, 167, 161, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    fontFamily: fonts.medium,
    color: "#FF8E8E",
    marginTop: spacing.md,
    fontSize: 13,
  },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontFamily: fonts.bold,
    color: colors.ice,
    fontSize: 16,
    marginBottom: 6,
  },
  emptyText: {
    fontFamily: fonts.regular,
    color: colors.mint,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
  },
});
