import React, { useMemo, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable
} from "react-native";

const DAY_MS = 1000 * 60 * 60 * 24;

const LEVEL_COLORS = [
  "#1a2035", // 0 - no purchase
  "#1c4a3d", // 1 - small
  "#237a5e", // 2
  "#2fae82", // 3
  "#4ecca3", // 4 - largest
];

export default function PurchaseHabitsCard({ commodities = [] }) {

  const stats = useMemo(() => {

    if (!commodities.length) return null;

    const withDates = commodities.filter(c => c.date);

    if (!withDates.length) return null;

    // ------------------------------------
    // Group individual line items into
    // "visits" — all purchases made on
    // the same date count as one buy
    // ------------------------------------

    const visitMap = {};

    for (const c of withDates) {
      const cost = Number(c.total_cost) || 0;

      if (!visitMap[c.date]) {
        visitMap[c.date] = { date: c.date, cost: 0, items: 0 };
      }

      visitMap[c.date].cost += cost;
      visitMap[c.date].items += 1;
    }

    const visits = Object.values(visitMap)
      .sort((a, b) => a.date.localeCompare(b.date));

    // ------------------------------------
    // Average purchase size ($ per visit)
    // ------------------------------------

    const totalCost = visits.reduce((sum, v) => sum + v.cost, 0);

    const avgPurchaseCost = totalCost / visits.length;

    // ------------------------------------
    // Average days between visits
    // ------------------------------------

    let avgDaysBetween = null;

    if (visits.length > 1) {

      const gaps = [];

      for (let i = 1; i < visits.length; i++) {
        const prev = new Date(visits[i - 1].date);
        const curr = new Date(visits[i].date);

        const days =
          (curr.getTime() - prev.getTime()) / DAY_MS;

        gaps.push(days);
      }

      avgDaysBetween =
        gaps.reduce((sum, d) => sum + d, 0) / gaps.length;
    }

    return {
      visitCount: visits.length,
      itemCount: withDates.length,
      avgPurchaseCost,
      avgDaysBetween,
      firstDate: visits[0].date,
      lastDate: visits[visits.length - 1].date,
      visitMap,
    };

  }, [commodities]);

  const heatmap = useMemo(() => {

    if (!stats) return null;

    return buildHeatmapWeeks(stats.visitMap, stats.firstDate);

  }, [stats]);

  const [selectedDate, setSelectedDate] = useState(null);

  if (!stats) return null;

  const selectedInfo = selectedDate
    ? stats.visitMap[selectedDate] || { date: selectedDate, cost: 0, items: 0 }
    : null;

  return (
    <View style={styles.card}>

      <Text style={styles.title}>PURCHASE HABITS</Text>

      <View style={styles.statsRow}>

        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>AVG PURCHASE</Text>
          <Text style={styles.statValue}>
            ${stats.avgPurchaseCost.toFixed(2)}
          </Text>
        </View>

        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>FREQUENCY</Text>
          <Text style={styles.statValue}>
            {formatCadence(stats.avgDaysBetween)}
          </Text>
        </View>

        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>TOTAL VISITS</Text>
          <Text style={styles.statValue}>
            {stats.visitCount}
          </Text>
          <Text style={styles.statSubtext}>
            {stats.itemCount} items
          </Text>
        </View>

      </View>

      <Text style={styles.sectionLabel}>PURCHASE ACTIVITY</Text>

      <PurchaseHeatmap
        weeks={heatmap}
        onSelect={setSelectedDate}
      />

      <Text style={styles.selectedText}>
        {selectedInfo
          ? `${formatDate(selectedInfo.date)} — ${
              selectedInfo.cost > 0
                ? `$${selectedInfo.cost.toFixed(2)} (${selectedInfo.items} item${selectedInfo.items === 1 ? "" : "s"})`
                : "No purchase"
            }`
          : "Tap a day to see details"}
      </Text>

    </View>
  );
}

function buildHeatmapWeeks(visitMap, firstDate) {

  const start = new Date(firstDate);

  // rewind to the Sunday of that week
  start.setDate(start.getDate() - start.getDay());

  const end = new Date();

  const costs = Object.values(visitMap).map(v => v.cost);
  const maxCost = Math.max(...costs, 0);

  const levelFor = (cost) => {
    if (cost <= 0) return 0;
    if (maxCost <= 0) return 0;

    const ratio = cost / maxCost;

    if (ratio > 0.75) return 4;
    if (ratio > 0.5) return 3;
    if (ratio > 0.25) return 2;
    return 1;
  };

  const weeks = [];

  let cursor = new Date(start);
  let week = [];
  let lastMonth = null;

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  while (cursor <= end) {

    const dateStr = cursor.toISOString().slice(0, 10);
    const visit = visitMap[dateStr];
    const cost = visit ? visit.cost : 0;

    if (week.length === 0) {
      const month = cursor.getMonth();

      if (month !== lastMonth) {
        week.monthLabel = monthNames[month];
        lastMonth = month;
      }
    }

    week.push({
      date: dateStr,
      cost,
      level: levelFor(cost),
    });

    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  if (week.length) {

    while (week.length < 7) {
      week.push(null);
    }

    weeks.push(week);
  }

  return weeks;
}

function PurchaseHeatmap({ weeks, onSelect }) {

  if (!weeks || !weeks.length) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      <View>

        <View style={styles.monthLabelRow}>
          {weeks.map((week, wi) => (
            <View
              key={wi}
              style={[
                styles.monthLabelSlot,
                week.monthLabel && wi !== 0 && styles.monthGap
              ]}
            >
              {week.monthLabel && (
                <Text style={styles.monthLabelText}>
                  {week.monthLabel}
                </Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.heatmapGrid}>

          {weeks.map((week, wi) => (
            <View
              key={wi}
              style={[
                styles.heatmapColumn,
                week.monthLabel && wi !== 0 && styles.monthGap
              ]}
            >
              {week.map((day, di) =>
                day ? (
                  <Pressable
                    key={di}
                    onPress={() => onSelect(day.date)}
                    style={[
                      styles.heatmapCell,
                      { backgroundColor: LEVEL_COLORS[day.level] }
                    ]}
                  />
                ) : (
                  <View key={di} style={styles.heatmapCellEmpty} />
                )
              )}
            </View>
          ))}

        </View>

      </View>
    </ScrollView>
  );
}

function formatDate(dateStr) {

  const d = new Date(dateStr);

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCadence(avgDays) {

  if (avgDays === null) {
    return "Only 1 visit";
  }

  if (avgDays < 1) {
    return "Multiple per day";
  }

  if (avgDays < 3) {
    return "Every ~day";
  }

  if (avgDays < 10) {
    return `Every ~${Math.round(avgDays)} days`;
  }

  if (avgDays < 17) {
    return "Every ~10 days";
  }

  if (avgDays < 25) {
    return "Every ~2 weeks";
  }

  if (avgDays < 45) {
    return "About once a month";
  }

  if (avgDays < 75) {
    return "About every 6 weeks";
  }

  if (avgDays < 105) {
    return "About every 3 months";
  }

  if (avgDays < 195) {
    return "About every 6 months";
  }

  return "Less than twice a year";
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

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statBlock: {
    alignItems: "flex-start",
  },

  statLabel: {
    color: "#555",
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  statValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  statSubtext: {
    color: "#555",
    fontSize: 11,
    marginTop: 2,
  },

  sectionLabel: {
    color: "#555",
    fontSize: 10,
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 8,
  },

  heatmapGrid: {
    flexDirection: "row",
  },

  heatmapColumn: {
    marginRight: 3,
  },

  heatmapCell: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginBottom: 3,
  },

  heatmapCellEmpty: {
    width: 12,
    height: 12,
    marginBottom: 3,
  },

  selectedText: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 10,
  },

  monthLabelRow: {
    flexDirection: "row",
    marginBottom: 4,
  },

  monthLabelSlot: {
    width: 12,
    marginRight: 3,
  },

  monthLabelText: {
    color: "#666",
    fontSize: 10,
    position: "absolute",
    left: 0,
  },

  monthGap: {
    marginLeft: 8,
  },
});