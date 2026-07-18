import React, { useMemo } from "react";

import { View, Text, StyleSheet } from "react-native";

const RECENT_COUNT = 5;

export default function PurchasePercentileCard({ commodities = [] }) {

  const ranked = useMemo(() => {

    const withMetal = commodities.filter(c => c.metal && c.date);

    if (!withMetal.length) return null;

    // ------------------------------------
    // Price per oz for each purchase line
    // ------------------------------------

    const enriched = withMetal
      .map(c => {

        const qty = Number(c.quantity) || 0;
        const oz = Number(c.weight_oz) || 0;
        const cost = Number(c.total_cost) || 0;

        const totalOz = qty * oz;
        const pricePerOz = totalOz > 0 ? cost / totalOz : null;

        return { ...c, pricePerOz };
      })
      .filter(c => c.pricePerOz !== null);

    // ------------------------------------
    // Rank within each metal, cheapest first
    // ------------------------------------

    const byMetal = {};

    for (const c of enriched) {
      if (!byMetal[c.metal]) byMetal[c.metal] = [];
      byMetal[c.metal].push(c);
    }

    for (const metal of Object.keys(byMetal)) {
      byMetal[metal].sort((a, b) => a.pricePerOz - b.pricePerOz);
    }

    const rankMap = new Map();

    for (const metal of Object.keys(byMetal)) {
      byMetal[metal].forEach((item, idx) => {
        rankMap.set(item, { rank: idx + 1, total: byMetal[metal].length });
      });
    }

    // ------------------------------------
    // Show most recent purchases, each
    // annotated with its rank
    // ------------------------------------

    return [...enriched]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, RECENT_COUNT)
      .map(item => ({ ...item, ...rankMap.get(item) }));

  }, [commodities]);

  if (!ranked || !ranked.length) return null;

  return (
    <View style={styles.card}>

      <Text style={styles.title}>RECENT BUYS RANKED</Text>

      {ranked.map((item, idx) => (
        <PurchaseRow
          key={`${item.id ?? idx}-${item.date}`}
          item={item}
          isFirst={idx === 0}
        />
      ))}

    </View>
  );
}

function PurchaseRow({ item, isFirst }) {

  const { rank, total, pricePerOz, metal, name, date } = item;

  const isTopHalf = rank <= Math.ceil(total / 2);

  const color =
    total <= 1 ? "#888" : (isTopHalf ? "#4ecca3" : "#e94560");

  const rankText =
    total <= 1
      ? "Only purchase"
      : `${ordinal(rank)} cheapest ${metal} buy of ${total}`;

  return (
    <View style={[styles.row, !isFirst && styles.rowBorder]}>

      <View style={styles.rowLeft}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.date}>{formatDate(date)}</Text>
      </View>

      <View style={styles.rowRight}>
        <Text style={styles.price}>
          ${pricePerOz.toFixed(2)}/oz
        </Text>
        <Text style={[styles.rank, { color }]}>
          {rankText}
        </Text>
      </View>

    </View>
  );
}

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function formatDate(dateStr) {

  const d = new Date(dateStr);

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },

  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: "#1f2a44",
  },

  rowLeft: {
    flexShrink: 1,
  },

  name: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  date: {
    color: "#555",
    fontSize: 11,
    marginTop: 2,
  },

  rowRight: {
    alignItems: "flex-end",
  },

  price: {
    color: "#ccc",
    fontSize: 13,
    fontWeight: "600",
  },

  rank: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: "600",
  },
});