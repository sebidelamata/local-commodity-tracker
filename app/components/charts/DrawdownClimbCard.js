import React, { useMemo } from "react";

import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

const DAY_MS = 1000 * 60 * 60 * 24;

const WINDOWS = [
  { key: "day", label: "DAY", days: 1 },
  { key: "month", label: "MONTH", days: 30 },
  { key: "year", label: "YEAR", days: 365 },
];

export default function DrawdownClimbCard({
  history,
  loading,
  commodities = []
}) {

  const dailyChanges = useMemo(() => {

    if (!history || !history.dates || !history.dates.length) {
      return null;
    }

    const dates = history.dates;
    const values = (history.series?.Total || []).map(p => Number(p.value));

    if (values.length !== dates.length) {
      return null;
    }

    // ------------------------------------
    // Cash flows: $ contributed per date
    // (so a purchase day isn't mistaken
    // for a market swing)
    // ------------------------------------

    const cashFlowsByDate = {};

    for (const c of commodities) {
      if (!c.date) continue;

      const cost = Number(c.total_cost) || 0;
      cashFlowsByDate[c.date] = (cashFlowsByDate[c.date] || 0) + cost;
    }

    // ------------------------------------
    // Net market change per day, excluding
    // the first day (no prior baseline)
    // ------------------------------------

    const changes = [];

    for (let i = 1; i < dates.length; i++) {

      const vStart = values[i - 1];
      const vEnd = values[i];
      const cf = cashFlowsByDate[dates[i]] || 0;

      if (vStart <= 0) continue;

      const dollarChange = vEnd - cf - vStart;
      const pctChange = (dollarChange / vStart) * 100;

      changes.push({ date: dates[i], dollarChange, pctChange });
    }

    return changes;

  }, [history, commodities]);

  const rows = useMemo(() => {

    if (!dailyChanges || !dailyChanges.length) return null;

    const lastDate = new Date(dailyChanges[dailyChanges.length - 1].date);
    const earliestDate = new Date(dailyChanges[0].date);

    return WINDOWS.map(w => {

      const cutoff = new Date(lastDate.getTime() - w.days * DAY_MS);

      const hasEnoughHistory = earliestDate.getTime() <= cutoff.getTime();

      if (!hasEnoughHistory) {
        return { ...w, climb: null, drawdown: null };
      }

      const windowEntries = dailyChanges.filter(
        e => new Date(e.date).getTime() >= cutoff.getTime()
      );

      if (!windowEntries.length) {
        return { ...w, climb: null, drawdown: null };
      }

      const climb = windowEntries.reduce(
        (best, e) => (e.dollarChange > best.dollarChange ? e : best),
        windowEntries[0]
      );

      const drawdown = windowEntries.reduce(
        (worst, e) => (e.dollarChange < worst.dollarChange ? e : worst),
        windowEntries[0]
      );

      return { ...w, climb, drawdown };

    });

  }, [dailyChanges]);

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color="#4ecca3" />
      </View>
    );
  }

  if (!rows) return null;

  return (
    <View style={styles.card}>

      <Text style={styles.title}>BIGGEST PORTFOLIO SINGLE-DAY MOVES</Text>

      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.periodCol]} />
        <Text style={[styles.headerCell, styles.valueCol]}>DRAWDOWN</Text>
        <Text style={[styles.headerCell, styles.valueCol]}>CLIMB</Text>
      </View>

      {rows.map(row => (
        <MoveRow key={row.key} row={row} />
      ))}

    </View>
  );
}

function MoveRow({ row }) {

  return (
    <View style={styles.row}>

      <Text style={[styles.periodLabel, styles.periodCol]}>
        {row.label}
      </Text>

      <MoveCell entry={row.drawdown} color="#e94560" />
      <MoveCell entry={row.climb} color="#4ecca3" />

    </View>
  );
}

function MoveCell({ entry, color }) {

  if (!entry) {
    return (
      <View style={styles.valueCol}>
        <Text style={styles.dash}>--</Text>
      </View>
    );
  }

  const isPositive = entry.dollarChange >= 0;

  return (
    <View style={styles.valueCol}>
      <Text style={[styles.dollarText, { color }]}>
        {isPositive ? "+" : "-"}$
        {Math.abs(entry.dollarChange).toFixed(2)}
      </Text>
      <Text style={[styles.pctText, { color }]}>
        {isPositive ? "+" : ""}{entry.pctChange.toFixed(2)}%
      </Text>
    </View>
  );
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

  headerRow: {
    flexDirection: "row",
    marginBottom: 8,
  },

  headerCell: {
    color: "#555",
    fontSize: 10,
    letterSpacing: 0.5,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#1f2a44",
  },

  periodCol: {
    width: 60,
  },

  periodLabel: {
    color: "#aaa",
    fontSize: 12,
    fontWeight: "600",
  },

  valueCol: {
    flex: 1,
  },

  dollarText: {
    fontSize: 14,
    fontWeight: "bold",
  },

  pctText: {
    fontSize: 11,
    marginTop: 2,
  },

  dash: {
    color: "#555",
    fontSize: 14,
  },
});