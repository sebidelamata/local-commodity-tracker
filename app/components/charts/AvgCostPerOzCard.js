import React, { useMemo } from "react";

import { View, Text, StyleSheet } from "react-native";

export default function AvgCostPerOzCard({
  commodities = [],
  spotPrices = {}
}) {

  const rows = useMemo(() => {

    const byMetal = {};

    for (const c of commodities) {
      const metal = c.metal;

      if (!metal) continue;

      if (!byMetal[metal]) {
        byMetal[metal] = { totalCost: 0, totalOz: 0 };
      }

      const qty = Number(c.quantity) || 0;
      const oz = Number(c.weight_oz) || 0;
      const cost = Number(c.total_cost) || 0;

      byMetal[metal].totalCost += cost;
      byMetal[metal].totalOz += qty * oz;
    }

    return Object.entries(byMetal)
      .map(([metal, { totalCost, totalOz }]) => {

        if (!totalOz) return null;

        const avgCostPerOz = totalCost / totalOz;

        const spot =
          spotPrices[metal.toLowerCase()]?.price || null;

        const diffPct =
          spot
            ? ((spot - avgCostPerOz) / avgCostPerOz) * 100
            : null;

        return {
          metal,
          avgCostPerOz,
          spot,
          diffPct
        };

      })
      .filter(Boolean)
      .sort((a, b) => b.totalOz - a.totalOz);

  }, [commodities, spotPrices]);

  if (!rows.length) {
    return null;
  }

  return (
    <View style={styles.card}>

      <Text style={styles.title}>AVG COST PER OZ</Text>

      {rows.map(row => (
        <MetalRow key={row.metal} {...row} />
      ))}

    </View>
  );
}

function MetalRow({ metal, avgCostPerOz, spot, diffPct }) {

  const statusColor =
    diffPct === null
      ? "#888"
      : diffPct >= 0
        ? "#4ecca3"
        : "#e94560";

  const statusText =
    diffPct === null
      ? "Spot price unavailable"
      : diffPct >= 0
        ? `${diffPct.toFixed(1)}% below spot`
        : `${Math.abs(diffPct).toFixed(1)}% above spot`;

  // ------------------------------------
  // Bullet bar geometry
  // ------------------------------------

  const maxVal =
    spot
      ? Math.max(spot, avgCostPerOz) * 1.15
      : avgCostPerOz * 1.15;

  const spotPct = spot ? (spot / maxVal) * 100 : 0;
  const avgPct = (avgCostPerOz / maxVal) * 100;

  const diffLeft = Math.min(spotPct, avgPct);
  const diffWidth = Math.abs(spotPct - avgPct);

  return (
    <View style={styles.row}>

      <View style={styles.rowHeader}>
        <Text style={styles.metalLabel}>{metal}</Text>

        <Text style={[styles.statusText, { color: statusColor }]}>
          {statusText}
        </Text>
      </View>

      {spot !== null && (
        <View style={styles.barTrack}>

          <View
            style={[
              styles.barSpot,
              { width: `${spotPct}%` }
            ]}
          />

          <View
            style={[
              styles.barDiff,
              {
                left: `${diffLeft}%`,
                width: `${diffWidth}%`,
                backgroundColor: statusColor
              }
            ]}
          />

          <View
            style={[
              styles.avgMarker,
              { left: `${avgPct}%` }
            ]}
          />

        </View>
      )}

      <View style={styles.priceRow}>

        <View style={styles.priceBlock}>
          <View style={styles.legendDot} />
          <Text style={styles.priceLabel}>YOUR AVG</Text>
          <Text style={styles.priceValue}>
            ${avgCostPerOz.toFixed(2)}
          </Text>
        </View>

        <View style={styles.priceBlock}>
          <View style={[styles.legendDot, styles.legendDotGray]} />
          <Text style={styles.priceLabel}>SPOT NOW</Text>
          <Text style={styles.priceValue}>
            {spot === null ? "--" : `$${spot.toFixed(2)}`}
          </Text>
        </View>

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
    marginBottom: 12,
  },

  row: {
    marginBottom: 18,
  },

  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  metalLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  barTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0f172a",
    marginBottom: 10,
    position: "relative",
    overflow: "hidden",
  },

  barSpot: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#3a3f55",
  },

  barDiff: {
    position: "absolute",
    top: 0,
    bottom: 0,
    opacity: 0.65,
  },

  avgMarker: {
    position: "absolute",
    top: -2,
    bottom: -2,
    width: 2,
    backgroundColor: "#fff",
    marginLeft: -1,
  },

  priceRow: {
    flexDirection: "row",
  },

  priceBlock: {
    marginRight: 24,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginRight: 6,
  },

  legendDotGray: {
    backgroundColor: "#3a3f55",
  },

  priceLabel: {
    color: "#555",
    fontSize: 10,
    letterSpacing: 0.5,
    marginRight: 6,
  },

  priceValue: {
    color: "#ccc",
    fontSize: 14,
    fontWeight: "600",
  },
});