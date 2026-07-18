import React, { useMemo } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from "react-native";

export default function TimeWeightedReturnCard({
  history,
  loading,
  commodities = []
}) {

  const stats = useMemo(() => {

    if (!history || !history.dates || !history.dates.length) {
      return null;
    }

    const dates = history.dates;
    const values = (history.series?.Total || []).map(p => Number(p.value));

    if (values.length !== dates.length) {
      return null;
    }

    // ------------------------------------
    // Cash flows: total $ contributed per date
    // ------------------------------------

    const cashFlowsByDate = {};
    let totalCost = 0;

    for (const c of commodities) {
      const cost = Number(c.total_cost) || 0;

      if (c.date) {
        cashFlowsByDate[c.date] = (cashFlowsByDate[c.date] || 0) + cost;
      }

      totalCost += cost;
    }

    // ------------------------------------
    // Daily returns (strips out cash flow effect)
    // ------------------------------------

    const dailyReturns = [];

    for (let i = 0; i < dates.length; i++) {

      const vStart = i === 0 ? 0 : values[i - 1];
      const vEnd = values[i];
      const cf = cashFlowsByDate[dates[i]] || 0;

      const r = vStart > 0 ? (vEnd - cf - vStart) / vStart : 0;

      dailyReturns.push({ date: dates[i], r });
    }

    // ------------------------------------
    // Time-weighted return: compound daily returns
    // ------------------------------------

    const twr =
      (dailyReturns.reduce((acc, d) => acc * (1 + d.r), 1) - 1) * 100;

    // ------------------------------------
    // Money-weighted return: naive value / cost
    // ------------------------------------

    const currentValue = values[values.length - 1];

    const mwr =
      totalCost > 0
        ? ((currentValue - totalCost) / totalCost) * 100
        : null;

    // ------------------------------------
    // Monthly breakdown: compound daily returns
    // within each calendar month
    // ------------------------------------

    const monthBuckets = {};

    for (const d of dailyReturns) {
      const monthKey = d.date.slice(0, 7); // "YYYY-MM"

      if (!monthBuckets[monthKey]) {
        monthBuckets[monthKey] = 1;
      }

      monthBuckets[monthKey] *= (1 + d.r);
    }

    const monthly = Object.entries(monthBuckets)
      .map(([month, factor]) => ({
        month,
        returnPct: (factor - 1) * 100,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      mwr,
      twr,
      monthly,
    };

  }, [history, commodities]);

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color="#4ecca3" />
      </View>
    );
  }

  if (!stats || stats.mwr === null) {
    return null;
  }

  const gap = stats.mwr - stats.twr;

  const gapLabel =
    Math.abs(gap) < 0.1
      ? "Timing had little effect"
      : gap > 0
        ? "Your timing helped your return"
        : "Your timing hurt your return";

  return (
    <View style={styles.card}>

      <Text style={styles.title}>
        MONEY-WEIGHTED VS TIME-WEIGHTED RETURN
      </Text>

      <View style={styles.headlineRow}>

        <StatBlock
          label="MONEY-WEIGHTED"
          value={stats.mwr}
        />

        <StatBlock
          label="TIME-WEIGHTED"
          value={stats.twr}
        />

      </View>

      <Text style={styles.gapNote}>
        {gapLabel} ({gap > 0 ? "+" : ""}{gap.toFixed(1)}% gap)
      </Text>

      <Text style={styles.sectionLabel}>MONTHLY RETURNS</Text>

      <MonthlyBarChart monthly={stats.monthly} />

    </View>
  );
}

function StatBlock({ label, value }) {

  const color = value >= 0 ? "#4ecca3" : "#e94560";

  return (
    <View style={styles.statBlock}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>
        {value >= 0 ? "+" : ""}{value.toFixed(1)}%
      </Text>
    </View>
  );
}

function MonthlyBarChart({ monthly }) {

  if (!monthly.length) return null;

  const maxAbs = Math.max(
    ...monthly.map(m => Math.abs(m.returnPct)),
    1
  );

  const HALF_HEIGHT = 45;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.barScroll}
    >
      {monthly.map(m => {

        const barHeight =
          (Math.abs(m.returnPct) / maxAbs) * HALF_HEIGHT;

        const isPositive = m.returnPct >= 0;
        const color = isPositive ? "#4ecca3" : "#e94560";

        return (
          <View key={m.month} style={styles.barColumn}>

            <Text style={[styles.barValue, { color }]}>
              {isPositive ? "+" : ""}{m.returnPct.toFixed(1)}%
            </Text>

            <View style={styles.barAxis}>

              {isPositive ? (
                <>
                  <View
                    style={[
                      styles.bar,
                      { height: barHeight, backgroundColor: color }
                    ]}
                  />
                  <View style={styles.barZeroLine} />
                </>
              ) : (
                <>
                  <View style={styles.barZeroLine} />
                  <View
                    style={[
                      styles.bar,
                      { height: barHeight, backgroundColor: color }
                    ]}
                  />
                </>
              )}

            </View>

            <Text style={styles.barLabel}>
              {formatMonth(m.month)}
            </Text>

          </View>
        );
      })}
    </ScrollView>
  );
}

function formatMonth(monthKey) {
  const [year, month] = monthKey.split("-");

  const names = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  return `${names[parseInt(month, 10) - 1]} '${year.slice(2)}`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#16213e",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },

  title: {
    color: "#888",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 14,
  },

  headlineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statBlock: {
    flex: 1,
  },

  statLabel: {
    color: "#555",
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  statValue: {
    fontSize: 20,
    fontWeight: "bold",
  },

  gapNote: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 10,
  },

  sectionLabel: {
    color: "#555",
    fontSize: 10,
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 8,
  },

  barScroll: {
    paddingVertical: 4,
  },

  barColumn: {
    alignItems: "center",
    marginRight: 18,
    width: 48,
  },

  barValue: {
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 4,
  },

  barAxis: {
    height: 90,
    justifyContent: "center",
    width: 20,
  },

  bar: {
    width: 20,
    borderRadius: 3,
  },

  barZeroLine: {
    height: 1,
    backgroundColor: "#3a3f55",
    width: 24,
    marginLeft: -2,
  },

  barLabel: {
    color: "#888",
    fontSize: 10,
    marginTop: 6,
  },
});