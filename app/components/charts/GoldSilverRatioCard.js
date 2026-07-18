import React, { useMemo } from "react";

import { View, Text, StyleSheet } from "react-native";

const HISTORICAL_LOW = 40;
const HISTORICAL_HIGH = 100;

export default function GoldSilverRatioCard({
  spotPrices = {},
  previousPrices = {}
}) {

  const gold = spotPrices.gold?.price || 0;
  const silver = spotPrices.silver?.price || 0;

  const prevGold = previousPrices.gold?.price || 0;
  const prevSilver = previousPrices.silver?.price || 0;

  const ratio = useMemo(() => {
    if (!gold || !silver) return null;
    return gold / silver;
  }, [gold, silver]);

  const previousRatio = useMemo(() => {
    if (!prevGold || !prevSilver) return null;
    return prevGold / prevSilver;
  }, [prevGold, prevSilver]);

  const change = useMemo(() => {
    if (ratio === null || !previousRatio) return null;

    return ((ratio - previousRatio) / previousRatio) * 100;
  }, [ratio, previousRatio]);

  const changeColor =
    change === null
      ? "#888"
      : change > 0
        ? "#4ecca3"
        : change < 0
          ? "#e94560"
          : "#888";

  const position = useMemo(() => {
    if (ratio === null) return 0;

    const clamped = Math.max(
      HISTORICAL_LOW,
      Math.min(ratio, HISTORICAL_HIGH)
    );

    return (
      (clamped - HISTORICAL_LOW) /
      (HISTORICAL_HIGH - HISTORICAL_LOW)
    );
  }, [ratio]);

  const label = useMemo(() => {
    if (ratio === null) return null;

    if (ratio < HISTORICAL_LOW) {
      return "Below typical historical range";
    }

    if (ratio > HISTORICAL_HIGH) {
      return "Above typical historical range";
    }

    return "Within typical historical range";
  }, [ratio]);

  return (
    <View style={styles.card}>

      <Text style={styles.title}>GOLD / SILVER RATIO</Text>

      <View style={styles.ratioRow}>
        <Text style={styles.ratio}>
          {ratio === null ? "--" : ratio.toFixed(1)}
        </Text>

        <Text style={[styles.change, { color: changeColor }]}>
          {change === null
            ? "--"
            : `${change > 0 ? "+" : ""}${change.toFixed(2)}%`
          }
        </Text>
      </View>

      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { left: `${position * 100}%` }
          ]}
        />
      </View>

      <View style={styles.rangeLabels}>
        <Text style={styles.rangeText}>{HISTORICAL_LOW}</Text>
        <Text style={styles.rangeText}>{HISTORICAL_HIGH}</Text>
      </View>

      {label && (
        <Text style={styles.context}>{label}</Text>
      )}

      <Text style={styles.disclaimer}>
        Historical context only, not a trading signal.
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
  },

  ratioRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 6,
  },

  ratio: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },

  change: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 10,
  },

  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0f172a",
    marginTop: 14,
    position: "relative",
  },

  barFill: {
    position: "absolute",
    top: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#ffb86b",
    marginLeft: -7,
  },

  rangeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },

  rangeText: {
    color: "#555",
    fontSize: 11,
  },

  context: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 10,
  },

  disclaimer: {
    color: "#555",
    fontSize: 10,
    marginTop: 4,
    fontStyle: "italic",
  },
});