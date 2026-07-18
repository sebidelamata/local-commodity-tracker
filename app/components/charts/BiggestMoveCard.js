import React, { useMemo, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable
} from "react-native";

const WINDOWS = [
  { key: "week", label: "WEEK", days: 7 },
  { key: "month", label: "MONTH", days: 30 },
  { key: "year", label: "YEAR", days: 365 },
];

export default function BiggestMoveCard({
  history,
  loading,
  commodities = []
}) {

  const [scope, setScope] = useState("all"); // "all" | "ytd"

  const prepared = useMemo(() => {

    if (!history || !history.dates || !history.dates.length) {
      return null;
    }

    const dates = history.dates;
    const values = (history.series?.Total || []).map(p => Number(p.value));

    if (values.length !== dates.length) return null;

    const cashFlowsByDate = {};

    for (const c of commodities) {
      if (!c.date) continue;

      const cost = Number(c.total_cost) || 0;
      cashFlowsByDate[c.date] = (cashFlowsByDate[c.date] || 0) + cost;
    }

    const dailyChange = new Array(dates.length).fill(0);

    for (let i = 1; i < dates.length; i++) {
      const vStart = values[i - 1];
      const vEnd = values[i];
      const cf = cashFlowsByDate[dates[i]] || 0;

      dailyChange[i] = vStart > 0 ? vEnd - cf - vStart : 0;
    }

    const prefix = new Array(dates.length).fill(0);

    for (let i = 1; i < dates.length; i++) {
      prefix[i] = prefix[i - 1] + dailyChange[i];
    }

    const lastDate = dates[dates.length - 1];
    const currentYear = lastDate.slice(0, 4);

    const ytdAnchorIdx = dates.findIndex(d => d.slice(0, 4) === currentYear);

    return { dates, values, prefix, ytdAnchorIdx, lastDate };

  }, [history, commodities]);

  const ytdStat = useMemo(() => {

    if (!prepared || prepared.ytdAnchorIdx === -1) return null;

    const { prefix, values, ytdAnchorIdx, lastDate, dates } = prepared;
    const n = dates.length;

    const dollarChange = prefix[n - 1] - prefix[ytdAnchorIdx];
    const startValue = values[ytdAnchorIdx];
    const pctChange = startValue > 0 ? (dollarChange / startValue) * 100 : 0;

    return { dollarChange, pctChange, fromDate: dates[ytdAnchorIdx], toDate: lastDate };

  }, [prepared]);

  const rows = useMemo(() => {

    if (!prepared) return null;

    const { dates, values, prefix, ytdAnchorIdx } = prepared;
    const n = dates.length;

    // When scope is YTD, only consider windows that start on/after
    // the first date of the current year.
    const lowerBoundIdx = scope === "ytd" ? ytdAnchorIdx : 0;

    if (scope === "ytd" && lowerBoundIdx === -1) {
      return WINDOWS.map(w => ({ ...w, best: null, worst: null }));
    }

    return WINDOWS.map(w => {

      const windowDays = w.days;

      let best = null;
      let worst = null;

      const earliestStart = Math.max(1, lowerBoundIdx + 1);

      for (let start = earliestStart; start + windowDays - 1 <= n - 1; start++) {

  const end = start + windowDays - 1;
  const dollarChange = prefix[end] - prefix[start - 1];
  const startValue = values[start - 1];

  const MIN_BASE = 50; // below this, % is not meaningful

  const pctChange =
    startValue >= MIN_BASE ? (dollarChange / startValue) * 100 : null;

  const move = {
    dollarChange,
    pctChange,
    fromDate: dates[start - 1],
    toDate: dates[end],
  };

  if (!best || move.dollarChange > best.dollarChange) best = move;
  if (!worst || move.dollarChange < worst.dollarChange) worst = move;
}

      return { ...w, best, worst };

    });

  }, [prepared, scope]);

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

      <View style={styles.headerTop}>

        <Text style={styles.title}>PORTFOLIO MOVES</Text>

        <View style={styles.toggle}>

          <Pressable
            onPress={() => setScope("all")}
            style={[styles.toggleBtn, scope === "all" && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleText, scope === "all" && styles.toggleTextActive]}>
              ALL-TIME
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setScope("ytd")}
            style={[styles.toggleBtn, scope === "ytd" && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleText, scope === "ytd" && styles.toggleTextActive]}>
              YTD
            </Text>
          </Pressable>

        </View>

      </View>

      {scope === "ytd" && (
        <YtdStatLine stat={ytdStat} />
      )}

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

function YtdStatLine({ stat }) {

  if (!stat) {
    return (
      <Text style={styles.ytdLine}>
        YTD cumulative move: --
      </Text>
    );
  }

  const isPositive = stat.dollarChange >= 0;
  const color = isPositive ? "#4ecca3" : "#e94560";

  return (
    <Text style={styles.ytdLine}>
      YTD cumulative move:{" "}
      <Text style={{ color, fontWeight: "bold" }}>
        {isPositive ? "+" : "-"}${Math.abs(stat.dollarChange).toFixed(2)}
        {" "}({isPositive ? "+" : ""}{stat.pctChange.toFixed(2)}%)
      </Text>
    </Text>
  );
}

function MoveRow({ row }) {

  return (
    <View style={styles.row}>

      <Text style={[styles.periodLabel, styles.periodCol]}>
        {row.label}
      </Text>

      <MoveCell entry={row.worst} color="#e94560" />
      <MoveCell entry={row.best} color="#4ecca3" />

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
        {entry.pctChange === null
          ? "% n/a (low base)"
          : `${entry.pctChange > 0 ? "+" : ""}${entry.pctChange.toFixed(2)}%`
        }
      </Text>
      <Text style={styles.dateRange}>
        {formatShortDate(entry.fromDate)} → {formatShortDate(entry.toDate)}
      </Text>
    </View>
  );
}

function formatShortDate(dateStr) {

  const d = new Date(dateStr);

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#16213e",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  title: {
    color: "#888",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  toggle: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    borderRadius: 8,
    padding: 2,
  },

  toggleBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },

  toggleBtnActive: {
    backgroundColor: "#1f2a44",
  },

  toggleText: {
    color: "#555",
    fontSize: 10,
    fontWeight: "700",
  },

  toggleTextActive: {
    color: "#4ecca3",
  },

  ytdLine: {
    color: "#888",
    fontSize: 12,
    marginBottom: 12,
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

    dateRange: {    
        color: "#aaa"
    }
});