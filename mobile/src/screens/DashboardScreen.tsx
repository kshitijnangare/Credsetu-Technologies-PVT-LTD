import React, { useCallback, useState } from "react";
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
import { getErrorMessage, loanApi } from "../api/client";
import { AddLoanModal } from "../components/AddLoanModal";
import { LoanCard } from "../components/LoanCard";
import { SummaryCard } from "../components/SummaryCard";
import { useAuth } from "../context/AuthContext";
import { colors, spacing } from "../theme";
import type { Loan, LoanSummary } from "../types";

export const DashboardScreen = () => {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [repayingId, setRepayingId] = useState<string | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [summary, setSummary] = useState<LoanSummary>({
    totalLent: 0,
    totalRepaid: 0,
    overdueAmount: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const [loanRows, summaryRow] = await Promise.all([loanApi.list(), loanApi.summary()]);
    setLoans(loanRows);
    setSummary(summaryRow);
  }, []);

  React.useEffect(() => {
    const boot = async () => {
      try {
        await load();
      } catch (loadError) {
        setError(getErrorMessage(loadError));
      } finally {
        setLoading(false);
      }
    };
    void boot();
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setRefreshing(false);
    }
  };

  const repay = async (id: string) => {
    setRepayingId(id);
    try {
      await loanApi.repay(id);
      await load();
    } catch (repayError) {
      Alert.alert("Could not update loan", getErrorMessage(repayError));
    } finally {
      setRepayingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable style={styles.menuButton} onPress={() => setSidebarOpen(true)}>
          <Text style={styles.menuIcon}>☰</Text>
        </Pressable>
        <View>
          <Text style={styles.kicker}>MiniLedger</Text>
          <Text style={styles.title}>Your loans</Text>
        </View>
        <Pressable style={styles.addChip} onPress={() => setAddOpen(true)}>
          <Text style={styles.addChipText}>+ Add</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} />}
        >
          <SummaryCard summary={summary} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Text style={styles.section}>Entries</Text>
          {loans.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No loans yet</Text>
              <Text style={styles.emptyText}>Add money you have lent to a friend to start tracking repayments.</Text>
            </View>
          ) : (
            loans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} onRepay={(id) => void repay(id)} busy={repayingId === loan.id} />
            ))
          )}
        </ScrollView>
      )}

      {sidebarOpen ? (
        <View style={styles.overlay}>
          <Pressable style={styles.overlayFill} onPress={() => setSidebarOpen(false)} />
          <View style={styles.sidebar}>
            <Text style={styles.sidebarTitle}>Menu</Text>
            <Pressable
              style={styles.sidebarItem}
              onPress={() => {
                setSidebarOpen(false);
                void refresh();
              }}
            >
              <Text style={styles.sidebarText}>Dashboard</Text>
            </Pressable>
            <Pressable
              style={styles.sidebarItem}
              onPress={() => {
                setSidebarOpen(false);
                setAddOpen(true);
              }}
            >
              <Text style={styles.sidebarText}>Add loan</Text>
            </Pressable>
            <Pressable
              style={[styles.sidebarItem, styles.logout]}
              onPress={() => {
                setSidebarOpen(false);
                void logout();
              }}
            >
              <Text style={styles.logoutText}>Log out</Text>
            </Pressable>
            <Pressable onPress={() => setSidebarOpen(false)}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <AddLoanModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={async (payload) => {
          try {
            await loanApi.create(payload);
            await load();
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
    backgroundColor: colors.background,
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
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  menuIcon: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  kicker: {
    color: colors.accent,
    fontWeight: "700",
    fontSize: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.primary,
  },
  addChip: {
    marginLeft: "auto",
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addChipText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  content: {
    padding: spacing.md,
    paddingBottom: 48,
  },
  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    color: colors.danger,
    marginTop: spacing.md,
  },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 6,
  },
  emptyText: {
    color: colors.muted,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
  },
  overlayFill: {
    flex: 1,
    backgroundColor: "rgba(15, 61, 62, 0.35)",
  },
  sidebar: {
    width: 250,
    backgroundColor: colors.surface,
    paddingTop: 48,
    paddingHorizontal: spacing.md,
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  sidebarItem: {
    paddingVertical: 12,
  },
  sidebarText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  logout: {
    marginTop: spacing.md,
  },
  logoutText: {
    color: colors.danger,
    fontWeight: "800",
    fontSize: 16,
  },
  closeText: {
    marginTop: spacing.lg,
    color: colors.muted,
    fontWeight: "600",
  },
});
