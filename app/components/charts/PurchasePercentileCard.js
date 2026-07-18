import React, { useMemo } from "react";

import { View, Text, StyleSheet } from "react-native";

const RECENT_VISITS = 5;

export default function PurchasePercentileCard({ commodities = [] }) {

  const recentVisits = useMemo(() => {

    const withData = commodities.filter(c => c.metal && c.date && c.name);

    if (!withData.length) return null;

    // ------------------------------------
    // Group into visit -> metal -> name.
    // Ranking happens at the metal level
    // within a visit (the "buy"); names
    // underneath are just a breakdown.
    // ------------------------------------

    const visitMap = {};

    for (const c of withData) {

      const qty = Number(c.quantity) || 0;
      const oz = Number(c.weight_oz) || 0;
      const cost = Number(c.total_cost) || 0;

      if (!visitMap[c.date]) {
        visitMap[c.date] = { date: c.date, totalCost: 0, metals: {} };
      }

      const visit = visitMap[c.date];
      visit.totalCost += cost;

      if (!visit.metals[c.metal]) {
        visit.metals[c.metal] = {
          metal: c.metal,
          totalCost: 0,
          totalOz: 0,
          names: {},
        };
      }

      const metalGroup = visit.metals[c.metal];
      metalGroup.totalCost += cost;
      metalGroup.totalOz += qty * oz;

      if (!metalGroup.names[c.name]) {
        metalGroup.names[c.name] = { name: c.name, totalCost: 0, totalOz: 0 };
      }

      metalGroup.names[c.name].totalCost += cost;
      metalGroup.names[c.name].totalOz += qty * oz;
    }

    const visits = Object.values(visitMap).map(v => ({
      date: v.date,
      totalCost: v.totalCost,
      metals: Object.values(v.metals)
        .filter(m => m.totalOz > 0)
        .map(m => ({
          metal: m.metal,
          totalCost: m.totalCost,
          totalOz: m.totalOz,
          pricePerOz: m.totalCost / m.totalOz,
          names: Object.values(m.names)
            .filter(n => n.totalOz > 0)
            .map(n => ({
              ...n,
              pricePerOz: n.totalCost / n.totalOz,
            })),
        })),
    }));

    // ------------------------------------
    // Rank each visit's metal-aggregate
    // against every other visit's buy of
    // that same metal, across all history
    // ------------------------------------

    const byMetal = {};

    for (const visit of visits) {
      for (const metalGroup of visit.metals) {
        if (!byMetal[metalGroup.metal]) byMetal[metalGroup.metal] = [];
        byMetal[metalGroup.metal].push(metalGroup);
      }
    }

    for (const metal of Object.keys(byMetal)) {
      byMetal[metal].sort((a, b) => a.pricePerOz - b.pricePerOz);

      byMetal[metal].forEach((group, idx) => {
        group.rank = idx + 1;
        group.total = byMetal[metal].length;
      });
    }

    // ------------------------------------
    // Return most recent visits
    // ------------------------------------

    return visits
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, RECENT_VISITS);

  }, [commodities]);

  if (!recentVisits || !recentVisits.length) return null;

  return (
    <View style={styles.card}>

      <Text style={styles.title}>RECENT BUYS RANKED</Text>

      {recentVisits.map((visit, idx) => (
        <VisitBlock
          key={visit.date}
          visit={visit}
          isFirst={idx === 0}
        />
      ))}

    </View>
  );
}

function VisitBlock({ visit, isFirst }) {

  return (
    <View style={[styles.visitBlock, !isFirst && styles.visitBorder]}>

      <View style={styles.visitHeader}>
        <Text style={styles.visitDate}>{formatDate(visit.date)}</Text>
        <Text style={styles.visitTotal}>
          ${visit.totalCost.toFixed(2)} total
        </Text>
      </View>

      {visit.metals.map(metalGroup => (
        <MetalGroupBlock key={metalGroup.metal} group={metalGroup} />
      ))}

    </View>
  );
}

function MetalGroupBlock({ group }) {

  const { metal, rank, total, pricePerOz, totalCost, names } = group;

  const isTopHalf = rank <= Math.ceil(total / 2);

  const color =
    total <= 1 ? "#888" : (isTopHalf ? "#4ecca3" : "#e94560");

  const rankText =
    total <= 1
      ? "Only purchase"
      : `${ordinal(rank)} cheapest ${metal} buy of ${total}`;

  return (
    <View style={styles.metalBlock}>

      <View style={styles.metalHeader}>
        <Text style={styles.metalLabel}>{metal}</Text>

        <View style={styles.metalHeaderRight}>
          <Text style={styles.metalPrice}>
            ${pricePerOz.toFixed(2)}/oz avg
          </Text>
          <Text style={[styles.metalRank, { color }]}>
            {rankText}
          </Text>
        </View>
      </View>

      {names.map(n => (
        <View key={n.name} style={styles.nameRow}>
          <Text style={styles.nameLabel}>{n.name}</Text>
          <View style={styles.nameRight}>
            <Text style={styles.namePrice}>
              ${n.pricePerOz.toFixed(2)}/oz
            </Text>
            <Text style={styles.nameCost}>
              ${n.totalCost.toFixed(2)}
            </Text>
          </View>
        </View>
      ))}

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

  visitBlock: {
    paddingVertical: 10,
  },

  visitBorder: {
    borderTopWidth: 1,
    borderTopColor: "#1f2a44",
  },

  visitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  visitDate: {
    color: "#aaa",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  visitTotal: {
    color: "#888",
    fontSize: 12,
    fontWeight: "600",
  },

  metalBlock: {
    marginBottom: 8,
    paddingLeft: 8,
  },

  metalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  metalLabel: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  metalHeaderRight: {
    alignItems: "flex-end",
  },

  metalPrice: {
    color: "#ccc",
    fontSize: 12,
    fontWeight: "600",
  },

  metalRank: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: "600",
  },

  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 3,
    paddingLeft: 10,
  },

  nameLabel: {
    color: "#999",
    fontSize: 12,
  },

  nameRight: {
    flexDirection: "row",
  },

  namePrice: {
    color: "#777",
    fontSize: 11,
    marginRight: 10,
  },

  nameCost: {
    color: "#666",
    fontSize: 11,
  },
});