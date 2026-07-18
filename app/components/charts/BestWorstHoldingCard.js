import React, { useMemo } from "react";

import { View, Text, StyleSheet } from "react-native";

const GROUP_LABELS = {
  metal: "METAL",
  name: "TYPE",
  purity: "PURITY",
};

export default function BestWorstHoldingCard({
  commodities = [],
  spotPrices = {},
  groupBy = "name"
}) {

  const holdings = useMemo(() => {

    const byGroup = {};

    for (const c of commodities) {

      const key = c[groupBy];
      const metal = c.metal;

      if (!key || !metal) continue;

      if (!byGroup[key]) {
        byGroup[key] = {
          key: String(key),
          totalCost: 0,
          currentValue: 0,
          missingSpot: false,
        };
      }

      const qty = Number(c.quantity) || 0;
      const oz = Number(c.weight_oz) || 0;
      const cost = Number(c.total_cost) || 0;

      const spot = spotPrices[metal.toLowerCase()]?.price || null;

      byGroup[key].totalCost += cost;

      if (spot) {
        byGroup[key].currentValue += qty * oz * spot;
      } else {
        byGroup[key].missingSpot = true;
      }
    }

    return Object.values(byGroup)
      .filter(g => !g.missingSpot && g.totalCost > 0)
      .map(g => {

        const gainDollar = g.currentValue - g.totalCost;
        const gainPct = (gainDollar / g.totalCost) * 100;

        return {
          key: g.key,
          gainDollar,
          gainPct,
        };

      });

  }, [commodities, spotPrices, groupBy]);

  const { best, worst } = useMemo(() => {

    if (holdings.length < 1) return { best: null, worst: null };

    const sorted = [...holdings].sort(
      (a, b) => b.gainPct - a.gainPct
    );

    return {
      best: sorted[0],
      worst: sorted.length > 1
        ? sorted[sorted.length - 1]
        : null,
    };

  }, [holdings]);

  if (!best) return null;

  const groupLabel = GROUP_LABELS[groupBy] || groupBy.toUpperCase();

  return (
    <View style={styles.card}>

      <Text style={styles.title}>
        BEST / WORST BY {groupLabel}
      </Text>

      <HoldingRow
        label="TOP PERFORMER"
        holding={best}
        accent="#4ecca3"
      />

      {worst && (
        <HoldingRow
          label="LEAST PERFORMER"
          holding={worst}
          accent="#e94560"
        />
      )}

    </View>
  );
}

function HoldingRow({ label, holding, accent }) {

  const isPositive = holding.gainPct >= 0;

  const changeColor = isPositive ? "#4ecca3" : "#e94560";

  return (
    <View style={[styles.row, { borderLeftColor: accent }]}>

      <View style={styles.rowLeft}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowName}>{holding.key}</Text>
      </View>

      <View style={styles.rowRight}>
        <Text style={[styles.pct, { color: changeColor }]}>
          {isPositive ? "+" : ""}{holding.gainPct.toFixed(1)}%
        </Text>

        <Text style={[styles.dollar, { color: changeColor }]}>
          {isPositive ? "+" : "-"}$
          {Math.abs(holding.gainDollar).toFixed(2)}
        </Text>
      </View>

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

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderLeftWidth: 3,
    paddingLeft: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },

  rowLeft: {
    flexShrink: 1,
  },

  rowLabel: {
    color: "#555",
    fontSize: 10,
    letterSpacing: 0.5,
  },

  rowName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },

  rowRight: {
    alignItems: "flex-end",
  },

  pct: {
    fontSize: 15,
    fontWeight: "bold",
  },

  dollar: {
    fontSize: 12,
    marginTop: 2,
  },
});