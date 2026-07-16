import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { useAuth, API } from '../context/AuthContext';

import PortfolioPieChart from '../components/charts/PortfolioPieChart';
import PortfolioLineChart from '../components/charts/PortfolioLineChart';
import PriceTickerBanner from "../components/charts/PriceTickerBanner";
import PortfolioReturnCard from "../components/charts/PortfolioReturnCard";

import { METRICS } from '../lib/portfolioMetrics';

export default function DashboardScreen() {
  const { token, logout } = useAuth();

  const [commodities, setCommodities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [groupBy, setGroupBy] = useState('name');
  const [metric, setMetric] = useState(METRICS.COST);

  const [spotPrices, setSpotPrices] = useState({});

  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchCommodities = async () => {
    try {
      const res = await fetch(API + '/commodities', {
        headers: { Authorization: 'Bearer ' + token }
      });

      const data = await res.json();
      setCommodities(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setCommodities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrices = async () => {
    try {
      const res = await fetch(API + '/prices/spot', {
        headers: { Authorization: 'Bearer ' + token }
      });

      const text = await res.text();

      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        console.log("RAW PRICE RESPONSE:", text);
        return;
      }

      setSpotPrices(json.data || {});
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPortfolioHistory = async () => {
    setHistoryLoading(true);

    try {
      const res = await fetch(
        `${API}/portfolio/history?metric=${metric}&groupBy=${groupBy}`,
        { headers: { Authorization: 'Bearer ' + token } }
      );

      const json = await res.json();

      if (json.success) {
        setHistory(json.data);
      } else {
        console.error('Portfolio history error:', json.error);
        setHistory(null);
      }
    } catch (e) {
      console.error(e);
      setHistory(null);
    } finally {
      setHistoryLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCommodities();
      fetchPrices();
    }, [])
  );

  useEffect(() => {
    fetchPortfolioHistory();
  }, [metric, groupBy]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e94560" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={styles.header}>

        <Text style={styles.title}>
          My Dashboard
        </Text>

        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>
            Logout
          </Text>
        </TouchableOpacity>

      </View>

      <PriceTickerBanner
        spotPrices={spotPrices}
      />

      <PortfolioReturnCard
        commodities={commodities}
        spotPrices={spotPrices}
      />

      {/* GROUP BY */}
      <View style={styles.selectorRow}>
        {['metal', 'purity', 'name'].map((item) => (
          <Text
            key={item}
            onPress={() => setGroupBy(item)}
            style={[styles.selector, groupBy === item && styles.selectorActive]}
          >
            {item == 'name' ? "TYPE" : item.toUpperCase()}
          </Text>
        ))}
      </View>

      {/* METRIC SELECTOR */}
      <View style={styles.selectorRow}>
        {[
          { label: '$ VALUE', value: METRICS.VALUE },
          { label: 'COST', value: METRICS.COST },
          { label: 'OZ', value: METRICS.OZ },
          { label: 'GR', value: METRICS.GRAMS },
          { label: 'KG', value: METRICS.KG },
        ].map((item) => (
          <Text
            key={item.value}
            onPress={() => setMetric(item.value)}
            style={[styles.selector, metric === item.value && styles.selectorActive]}
          >
            {item.label}
          </Text>
        ))}
      </View>

      {/* PIE CHART */}
      <PortfolioPieChart
        data={commodities}
        groupBy={groupBy}
        metric={metric}
        spotPrices={spotPrices}
      />

      {/* LINE CHART */}
      <PortfolioLineChart
        history={history}
        loading={historyLoading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', padding: 16, paddingBottom: 120 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' },
  title: { color: '#e94560', fontSize: 24, fontWeight: 'bold', marginBottom: 16 },

  selectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    paddingVertical: 6,
  },

  selector: {
    color: '#888',
    fontSize: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },

  selectorActive: {
    color: '#fff',
    backgroundColor: 'rgba(78, 204, 163, 0.2)',
    borderWidth: 1,
    borderColor: '#4ecca3',
  },

  logout: {
    color: '#e94560',
    borderWidth: 1,
    borderColor: '#e94560',
    padding: 6,
    borderRadius: 6
  },

  header: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    paddingVertical: 6,
  },
});