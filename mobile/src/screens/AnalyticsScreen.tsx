import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sidebar } from "../components/Sidebar";
import { useLoanStore } from "../store/loanStore";
import { useUiStore } from "../store/uiStore";
import { colors, fonts, spacing } from "../theme";
import { formatCurrency, monthLabel } from "../utils/format";

export const AnalyticsScreen = () => {
  const openSidebar = useUiStore((state) => state.openSidebar);
  const { analytics, loading, error, loadAnalytics } = useLoanStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const refresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const maxMonthlyAmount = analytics?.monthly
    ? Math.max(
        ...analytics.monthly.map((m) => Math.max(m.lent, m.repaid)),
        1,
      )
    : 1;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable style={styles.menuButton} onPress={openSidebar}>
          <Text style={styles.menuIcon}>☰</Text>
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.kicker}>MINILEDGER</Text>
          <Text style={styles.title}>Analytics</Text>
        </View>
      </View>

      {loading && !analytics ? (
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
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Status Breakdown Grid */}
          <Text style={styles.section}>Status Overview</Text>
          <View style={styles.grid}>
            <View style={styles.cardSmall}>
              <Text style={styles.metricLabel}>Total Loans</Text>
              <Text style={styles.metricVal}>{analytics?.counts.total ?? 0}</Text>
            </View>
            <View style={styles.cardSmall}>
              <Text style={styles.metricLabel}>Active</Text>
              <Text style={[styles.metricVal, { color: colors.ice }]}>{analytics?.counts.pending ?? 0}</Text>
            </View>
            <View style={styles.cardSmall}>
              <Text style={styles.metricLabel}>Repaid</Text>
              <Text style={[styles.metricVal, { color: colors.teal }]}>{analytics?.counts.repaid ?? 0}</Text>
            </View>
            <View style={[styles.cardSmall, (analytics?.counts.overdue ?? 0) > 0 && styles.overdueBorder]}>
              <Text style={[styles.metricLabel, (analytics?.counts.overdue ?? 0) > 0 && { color: "#FF8E8E" }]}>
                Overdue
              </Text>
              <Text
                style={[
                  styles.metricVal,
                  (analytics?.counts.overdue ?? 0) > 0 && { color: "#FF8E8E" },
                ]}
              >
                {analytics?.counts.overdue ?? 0}
              </Text>
            </View>
          </View>

          {/* Capital Allocation Card */}
          <Text style={styles.section}>Capital Balance</Text>
          <View style={styles.balanceCard}>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Total Lent</Text>
              <Text style={styles.balanceValue}>{formatCurrency(analytics?.summary.totalLent ?? 0)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Total Repaid</Text>
              <Text style={[styles.balanceValue, { color: colors.teal }]}>
                {formatCurrency(analytics?.summary.totalRepaid ?? 0)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Overdue Amount</Text>
              <Text style={[styles.balanceValue, (analytics?.summary.overdueAmount ?? 0) > 0 && styles.overdueValue]}>
                {formatCurrency(analytics?.summary.overdueAmount ?? 0)}
              </Text>
            </View>
          </View>

          {/* Monthly Trajectory */}
          <Text style={styles.section}>6-Month Activity</Text>
          <View style={styles.card}>
            {analytics?.monthly && analytics.monthly.length > 0 ? (
              analytics.monthly.map((point) => {
                const lentRatio = Math.min(1, point.lent / maxMonthlyAmount);
                const repaidRatio = Math.min(1, point.repaid / maxMonthlyAmount);

                return (
                  <View key={point.month} style={styles.monthRow}>
                    <Text style={styles.monthTitle}>{monthLabel(point.month)}</Text>
                    <View style={styles.barStack}>
                      <View style={styles.barLine}>
                        <View style={[styles.barFillLent, { flex: Math.max(0.03, lentRatio) }]} />
                        <View style={{ flex: Math.max(0, 1 - lentRatio) }} />
                        <Text style={styles.barText}>{formatCurrency(point.lent)}</Text>
                      </View>
                      <View style={styles.barLine}>
                        <View style={[styles.barFillRepaid, { flex: Math.max(0.03, repaidRatio) }]} />
                        <View style={{ flex: Math.max(0, 1 - repaidRatio) }} />
                        <Text style={styles.barTextRepaid}>{formatCurrency(point.repaid)}</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>No monthly history available yet.</Text>
            )}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={styles.legendDotLent} />
                <Text style={styles.legendText}>Lent</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={styles.legendDotRepaid} />
                <Text style={styles.legendText}>Repaid</Text>
              </View>
            </View>
          </View>

          {/* Top Friends with Outstanding Balances */}
          <Text style={styles.section}>Top Outstanding Borrowers</Text>
          {analytics?.topFriends && analytics.topFriends.length > 0 ? (
            analytics.topFriends.map((friend) => (
              <View key={friend.friendName} style={styles.friendCard}>
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{friend.friendName}</Text>
                  <Text style={styles.friendMeta}>
                    {friend.loanCount} {friend.loanCount === 1 ? "loan" : "loans"}
                  </Text>
                </View>
                <Text style={styles.friendAmount}>{formatCurrency(friend.outstanding)}</Text>
              </View>
            ))
          ) : (
            <View style={styles.card}>
              <Text style={styles.emptyText}>🎉 No outstanding balances with friends!</Text>
            </View>
          )}
        </ScrollView>
      )}

      <Sidebar />
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
  content: {
    padding: spacing.md,
    paddingBottom: 48,
  },
  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.mint,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    fontFamily: fonts.medium,
    color: "#FF8E8E",
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  cardSmall: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.sm,
    minHeight: 74,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
  },
  overdueBorder: {
    borderColor: "rgba(255, 123, 123, 0.4)",
    backgroundColor: "rgba(255, 123, 123, 0.08)",
  },
  metricLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.mint,
  },
  metricVal: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.ice,
  },
  balanceCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(166, 214, 201, 0.12)",
    marginVertical: 2,
  },
  balanceLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.mint,
  },
  balanceValue: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.ice,
  },
  overdueValue: {
    color: "#FF8E8E",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  monthRow: {
    marginBottom: spacing.sm,
  },
  monthTitle: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.mint,
    marginBottom: 4,
  },
  barStack: {
    gap: 4,
  },
  barLine: {
    flexDirection: "row",
    alignItems: "center",
    height: 18,
    backgroundColor: colors.background,
    borderRadius: 8,
    overflow: "hidden",
  },
  barFillLent: {
    height: "100%",
    backgroundColor: colors.ice,
    borderRadius: 8,
  },
  barFillRepaid: {
    height: "100%",
    backgroundColor: colors.teal,
    borderRadius: 8,
  },
  barText: {
    position: "absolute",
    right: 8,
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.canvas,
  },
  barTextRepaid: {
    position: "absolute",
    right: 8,
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.ice,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDotLent: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.ice,
  },
  legendDotRepaid: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.teal,
  },
  legendText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.mint,
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.ice,
  },
  friendMeta: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.mint,
    marginTop: 2,
  },
  friendAmount: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.teal,
  },
  emptyText: {
    fontFamily: fonts.regular,
    color: colors.mint,
    fontSize: 13,
  },
});
