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
          <Text style={styles.kicker}>MiniLedger</Text>
          <Text style={styles.title}>Loans</Text>
        </View>
        <Pressable style={styles.addChip} onPress={() => setAddOpen(true)}>
          <Text style={styles.addChipText}>Add</Text>
        </Pressable>
      </View>

      {loading && loans.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.text} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={colors.text} />}
        >
          <SummaryCard summary={summary} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Text style={styles.section}>Entries</Text>
          {loans.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Nothing here yet</Text>
              <Text style={styles.emptyText}>Add money you have lent. Receipt photos go to Cloudinary.</Text>
            </View>
          ) : (
            loans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} onRepay={(id) => void repay(id)} busy={repayingId === loan.id} />
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
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  menuIcon: {
    color: colors.text,
    fontSize: 18,
  },
  headerCopy: {
    flex: 1,
  },
  kicker: {
    fontFamily: fonts.regular,
    color: colors.muted,
    fontSize: 12,
    letterSpacing: 1,
  },
  title: {
    fontFamily: fonts.regular,
    fontSize: 22,
    color: colors.text,
  },
  addChip: {
    backgroundColor: colors.text,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addChipText: {
    color: colors.canvas,
    fontFamily: fonts.regular,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 48,
  },
  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    fontFamily: fonts.regular,
    color: colors.text,
    marginTop: spacing.md,
  },
  empty: {
    backgroundColor: colors.background,
    borderRadius: 18,
    padding: spacing.lg,
  },
  emptyTitle: {
    fontFamily: fonts.regular,
    color: colors.text,
    marginBottom: 6,
  },
  emptyText: {
    fontFamily: fonts.regular,
    color: colors.muted,
  },
});
