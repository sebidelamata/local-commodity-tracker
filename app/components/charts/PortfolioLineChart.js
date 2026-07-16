import React, { useMemo, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator
} from "react-native";

import * as Haptics from "expo-haptics";

import Svg, { Path, Line, Circle } from "react-native-svg";

const PALETTE = [
  "#4ecca3",
  "#e94560",
  "#ffb86b",
  "#7b68ee",
  "#45aaf2",
  "#fd79a8",
  "#00cec9"
];

export default function PortfolioLineChart({ history, loading }) {

  const [selectedIndex, setSelectedIndex] = useState(null);
  const [hidden, setHidden] = useState({});
  console.log('PortfolioLineChart history:', history);

  const chartData = useMemo(() => {
    if (!history || !history.dates || !history.dates.length) {
      return null;
    }

    return history;
  }, [history]);

  if (loading) {
    return (
      <View style={styles.empty}>
        <ActivityIndicator color="#4ecca3" />
      </View>
    );
  }

  if (!chartData) {
    return (
      <View style={styles.empty}>
        <Text style={styles.text}>
          No portfolio history
        </Text>
      </View>
    );
  }

  const { dates, series } = chartData;

  const visibleSeries = Object.fromEntries(
    Object.entries(series).filter(([key]) => !hidden[key])
  );

  const WIDTH = 340;
  const HEIGHT = 220;
  const PAD = 35;

  const values = Object.values(visibleSeries)
    .flat()
    .map(x => Number(x.value));

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const x = (index) =>
    PAD +
    (index / Math.max(dates.length - 1, 1)) *
    (WIDTH - PAD * 2);

  const y = (value) =>
    PAD +
    (HEIGHT - PAD * 2) -
    ((value - min) / range) * (HEIGHT - PAD * 2);

  const nonTotalKeys = Object.keys(series).filter(k => k !== "Total");

  const colors = { Total: "#ffffff" };

  nonTotalKeys.forEach((key, index) => {
    colors[key] = PALETTE[index % PALETTE.length];
  });

  const makePath = (points) =>
    points
      .map((point, index) =>
        index === 0
          ? `M ${x(index)} ${y(point.value)}`
          : `L ${x(index)} ${y(point.value)}`
      )
      .join(" ");

  const handlePress = (event) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const touchX = event.nativeEvent.locationX;

    const index = Math.round(
      ((touchX - PAD) / (WIDTH - PAD * 2)) * (dates.length - 1)
    );

    const safeIndex = Math.max(0, Math.min(index, dates.length - 1));

    setSelectedIndex(safeIndex);
  };

  const toggleSeries = (key) => {
    Haptics.selectionAsync();

    setHidden(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const displayIndex =
    selectedIndex === null ? dates.length - 1 : selectedIndex;

  return (
    <View style={styles.container}>
      <Pressable
        style={{ width: WIDTH, height: HEIGHT }}
        onStartShouldSetResponder={() => true}
        onPress={handlePress}
      >
        <Svg width={WIDTH} height={HEIGHT}>

          {[0, .25, .5, .75, 1].map(v => (
            <Line
              key={v}
              x1={PAD}
              x2={WIDTH - PAD}
              y1={PAD + (HEIGHT - PAD * 2) * v}
              y2={PAD + (HEIGHT - PAD * 2) * v}
              stroke="#333"
            />
          ))}

          {Object.entries(visibleSeries).map(([key, points]) => (
            <Path
              key={key}
              d={makePath(points)}
              stroke={colors[key]}
              strokeWidth={key === "Total" ? 2 : 3}
              strokeDasharray={key === "Total" ? "8,6" : undefined}
              fill="none"
            />
          ))}

          {selectedIndex !== null && (
            <>
              <Line
                x1={x(selectedIndex)}
                x2={x(selectedIndex)}
                y1={PAD}
                y2={HEIGHT - PAD}
                stroke="#888"
                strokeDasharray="5,5"
              />

              {Object.entries(visibleSeries).map(([key, points]) => {
                const point = points[selectedIndex];

                if (!point) return null;

                return (
                  <Circle
                    key={key}
                    cx={x(selectedIndex)}
                    cy={y(point.value)}
                    r={5}
                    fill={colors[key]}
                  />
                );
              })}
            </>
          )}

        </Svg>
      </Pressable>

      <Text style={styles.date}>
        {dates[displayIndex]}
      </Text>

      <View style={styles.legend}>
        {Object.entries(series).map(([key, points]) => {
          const value = points[displayIndex]?.value || 0;
          const active = !hidden[key];

          return (
            <Pressable
              key={key}
              onPress={() => toggleSeries(key)}
              style={styles.row}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: active ? colors[key] : "#555" }
                ]}
              />

              <Text
                style={[
                  styles.text,
                  !active && { textDecorationLine: "line-through" }
                ]}
              >
                {key}
              </Text>

              <Text style={styles.value}>
                {format(value)}
              </Text>

              {key === "Total" && (
                <Text style={styles.total}>(dashed)</Text>
              )}
            </Pressable>
          );
        })}
      </View>

    </View>
  );
}

function format(value) {
  return Number(value).toLocaleString("en-US", {
    maximumFractionDigits: 2
  });
}

const styles = StyleSheet.create({
  container: { marginTop: 25, alignItems: "center" },
  legend: { marginTop: 10, width: "100%" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  dot: { height: 10, width: 10, borderRadius: 5, marginRight: 8 },
  text: { color: "#aaa" },
  value: { color: "#fff", marginLeft: "auto" },
  total: { color: "#666", marginLeft: 5 },
  date: { color: "#4ecca3", marginTop: 8 },
  empty: { padding: 20, alignItems: "center" }
});