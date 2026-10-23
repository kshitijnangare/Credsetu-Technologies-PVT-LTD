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
import { fonts, spacing, useTheme } from "../theme";

export const DashboardScreen = () => {
  const openSidebar = useUiStore((state) => state.openSidebar);
  const { loans, summary, loading, error, loadDashboard, createLoan, repayLoan } = useLoanStore();
  const { colors, isDark, toggleTheme } = useTheme();
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
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.canvas }]} edges={["top"]}>
      <View style={[styles.header, { backgroundColor: colors.canvas }]}>
        <Pressable
          style={[styles.menuButton, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={openSidebar}
        >
          <Text style={[styles.menuIcon, { color: colors.text }]}>☰</Text>
        </Pressable>

        <View style={styles.headerCopy}>
          <Text style={[styles.kicker, { color: colors.primary }]}>MINILEDGER</Text>
          <Text style={[styles.title, { color: colors.text }]}>Loans</Text>
        </View>

        {/* Quick Theme Toggle */}
        <Pressable
          style={[styles.themeBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={toggleTheme}
        >
          <Text style={styles.themeBtnText}>{isDark ? "☀️" : "🌙"}</Text>
        </Pressable>

        <Pressable
          style={[styles.addChip, { backgroundColor: colors.primary }]}
          onPress={() => setAddOpen(true)}
        >
          <Text style={[styles.addChipText, { color: colors.primaryText }]}>+ New</Text>
        </Pressable>
      </View>

      {loading && loans.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void refresh()}
              tintColor={colors.primary}
            />
          }
        >
          <SummaryCard summary={summary} />

          {error ? <Text style={[styles.error, { color: colors.text }]}>{error}</Text> : null}

          <View style={styles.sectionRow}>
            <Text style={[styles.section, { color: colors.text }]}>All Entries</Text>
            <View style={[styles.countBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.countText, { color: colors.text }]}>{loans.length}</Text>
            </View>
          </View>

          {loans.length === 0 ? (
            <View style={[styles.empty, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={styles.emptyIcon}>💸</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No loans recorded yet</Text>
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                Tap "+ New" above to record money lent with an optional receipt.
              </Text>
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
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  menuIcon: {
    fontSize: 22,
    fontFamily: fonts.bold,
  },
  headerCopy: {
    flex: 1,
  },
  kicker: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
  },
  themeBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  themeBtnText: {
    fontSize: 18,
  },
  addChip: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addChipText: {
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
    fontFamily: fonts.bold,
    fontSize: 14,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  countText: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    fontFamily: fonts.semiBold,
    marginTop: spacing.md,
    fontSize: 13,
  },
  empty: {
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1.5,
    marginTop: spacing.sm,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    marginBottom: 6,
  },
  emptyText: {
    fontFamily: fonts.medium,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
  },
});
