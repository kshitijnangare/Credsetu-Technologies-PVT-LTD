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
import { fonts, spacing, useTheme } from "../theme";
import { formatCurrency, monthLabel } from "../utils/format";

export const AnalyticsScreen = () => {
  const openSidebar = useUiStore((state) => state.openSidebar);
  const { analytics, loading, error, loadAnalytics } = useLoanStore();
  const { colors, isDark, toggleTheme } = useTheme();
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
          <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>
        </View>

        {/* Quick Theme Toggle */}
        <Pressable
          style={[styles.themeBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={toggleTheme}
        >
          <Text style={styles.themeBtnText}>{isDark ? "☀️" : "🌙"}</Text>
        </Pressable>
      </View>

      {loading && !analytics ? (
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
          {error ? <Text style={[styles.error, { color: colors.text }]}>{error}</Text> : null}

          {/* Status Breakdown Grid */}
          <Text style={[styles.section, { color: colors.text }]}>Status Overview</Text>
          <View style={styles.grid}>
            <View style={[styles.cardSmall, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.metricLabel, { color: colors.muted }]}>Total Loans</Text>
              <Text style={[styles.metricVal, { color: colors.text }]}>{analytics?.counts.total ?? 0}</Text>
            </View>
            <View style={[styles.cardSmall, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.metricLabel, { color: colors.muted }]}>Active</Text>
              <Text style={[styles.metricVal, { color: colors.text }]}>{analytics?.counts.pending ?? 0}</Text>
            </View>
            <View style={[styles.cardSmall, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.metricLabel, { color: colors.muted }]}>Repaid</Text>
              <Text style={[styles.metricVal, { color: colors.primary }]}>{analytics?.counts.repaid ?? 0}</Text>
            </View>
            <View
              style={[
                styles.cardSmall,
                { backgroundColor: colors.background, borderColor: colors.border },
                (analytics?.counts.overdue ?? 0) > 0 && { borderWidth: 2, borderColor: colors.primary },
              ]}
            >
              <Text style={[styles.metricLabel, { color: colors.muted }]}>Overdue</Text>
              <Text style={[styles.metricVal, { color: colors.primary }]}>{analytics?.counts.overdue ?? 0}</Text>
            </View>
          </View>

          {/* Capital Allocation Card */}
          <Text style={[styles.section, { color: colors.text }]}>Capital Balance</Text>
          <View style={[styles.balanceCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.balanceRow}>
              <Text style={[styles.balanceLabel, { color: colors.muted }]}>Total Lent</Text>
              <Text style={[styles.balanceValue, { color: colors.text }]}>
                {formatCurrency(analytics?.summary.totalLent ?? 0)}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.balanceRow}>
              <Text style={[styles.balanceLabel, { color: colors.muted }]}>Total Repaid</Text>
              <Text style={[styles.balanceValue, { color: colors.primary }]}>
                {formatCurrency(analytics?.summary.totalRepaid ?? 0)}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.balanceRow}>
              <Text style={[styles.balanceLabel, { color: colors.muted }]}>Overdue Amount</Text>
              <Text style={[styles.balanceValue, { color: colors.primary, textDecorationLine: "underline" }]}>
                {formatCurrency(analytics?.summary.overdueAmount ?? 0)}
              </Text>
            </View>
          </View>

          {/* Monthly Trajectory */}
          <Text style={[styles.section, { color: colors.text }]}>6-Month Activity</Text>
          <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
            {analytics?.monthly && analytics.monthly.length > 0 ? (
              analytics.monthly.map((point) => {
                const lentRatio = Math.min(1, point.lent / maxMonthlyAmount);
                const repaidRatio = Math.min(1, point.repaid / maxMonthlyAmount);

                return (
                  <View key={point.month} style={styles.monthRow}>
                    <Text style={[styles.monthTitle, { color: colors.text }]}>{monthLabel(point.month)}</Text>
                    <View style={styles.barStack}>
                      <View style={[styles.barLine, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={[styles.barFillLent, { backgroundColor: colors.primary, flex: Math.max(0.04, lentRatio) }]} />
                        <View style={{ flex: Math.max(0, 1 - lentRatio) }} />
                        <Text style={[styles.barText, { color: colors.text }]}>{formatCurrency(point.lent)}</Text>
                      </View>
                      <View style={[styles.barLine, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={[styles.barFillRepaid, { backgroundColor: colors.muted, flex: Math.max(0.04, repaidRatio) }]} />
                        <View style={{ flex: Math.max(0, 1 - repaidRatio) }} />
                        <Text style={[styles.barTextRepaid, { color: colors.text }]}>{formatCurrency(point.repaid)}</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={[styles.emptyText, { color: colors.muted }]}>No monthly history available yet.</Text>
            )}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDotLent, { backgroundColor: colors.primary }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Lent</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDotRepaid, { backgroundColor: colors.muted }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Repaid</Text>
              </View>
            </View>
          </View>

          {/* Top Borrowers */}
          <Text style={[styles.section, { color: colors.text }]}>Top Outstanding Borrowers</Text>
          {analytics?.topFriends && analytics.topFriends.length > 0 ? (
            analytics.topFriends.map((friend) => (
              <View
                key={friend.friendName}
                style={[styles.friendCard, { backgroundColor: colors.background, borderColor: colors.border }]}
              >
                <View style={styles.friendInfo}>
                  <Text style={[styles.friendName, { color: colors.text }]}>{friend.friendName}</Text>
                  <Text style={[styles.friendMeta, { color: colors.muted }]}>
                    {friend.loanCount} {friend.loanCount === 1 ? "loan" : "loans"}
                  </Text>
                </View>
                <Text style={[styles.friendAmount, { color: colors.primary }]}>{formatCurrency(friend.outstanding)}</Text>
              </View>
            ))
          ) : (
            <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.emptyText, { color: colors.muted }]}>No outstanding balances with friends!</Text>
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
  content: {
    padding: spacing.md,
    paddingBottom: 48,
  },
  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontFamily: fonts.bold,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    fontFamily: fonts.semiBold,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  cardSmall: {
    flex: 1,
    borderRadius: 16,
    padding: spacing.sm,
    minHeight: 74,
    justifyContent: "space-between",
    borderWidth: 1.5,
  },
  metricLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  metricVal: {
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  balanceCard: {
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1.5,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  divider: {
    height: 1.5,
    marginVertical: 2,
  },
  balanceLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  balanceValue: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  card: {
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1.5,
  },
  monthRow: {
    marginBottom: spacing.sm,
  },
  monthTitle: {
    fontFamily: fonts.bold,
    fontSize: 12,
    marginBottom: 4,
  },
  barStack: {
    gap: 4,
  },
  barLine: {
    flexDirection: "row",
    alignItems: "center",
    height: 18,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
  },
  barFillLent: {
    height: "100%",
    borderRadius: 6,
  },
  barFillRepaid: {
    height: "100%",
    borderRadius: 6,
  },
  barText: {
    position: "absolute",
    right: 8,
    fontFamily: fonts.bold,
    fontSize: 10,
  },
  barTextRepaid: {
    position: "absolute",
    right: 8,
    fontFamily: fonts.bold,
    fontSize: 10,
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
  },
  legendDotRepaid: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.xs,
    borderWidth: 1.5,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  friendMeta: {
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 2,
  },
  friendAmount: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  emptyText: {
    fontFamily: fonts.medium,
    fontSize: 13,
  },
});
