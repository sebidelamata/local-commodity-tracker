import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';

import { useAuth, API } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

export default function VaultScreen({ navigation }) {

  const { token, logout } = useAuth();

  const [commodities, setCommodities] = useState([]);
  const [spotPrices, setSpotPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  const fetchCommodities = async () => {
    try {

      const [commoditiesRes, pricesRes] = await Promise.all([
        fetch(API + "/commodities", {
          headers: {
            Authorization: "Bearer " + token
          }
        }),
        fetch(API + "/prices/spot", {
          headers: {
            Authorization: "Bearer " + token
          }
        })
      ]);

      const data = await commoditiesRes.json();
      const prices = await pricesRes.json();

      if (!res.ok) {

        if (res.status === 401) {
          Alert.alert(
            "Session expired",
            "Please login again."
          );

          logout();
          return;
        }

        throw new Error(data.error || "Request failed");
      }


      setCommodities(
        Array.isArray(data)
          ? data
          : []
      );
      setSpotPrices(
        prices.data || {}
      );


    } catch (err) {

      console.error(
        "Vault fetch failed:",
        err
      );

      setCommodities([]);

    } finally {

      setLoading(false);
      setRefreshing(false);

    }
  };


  useFocusEffect(
    useCallback(() => {

      fetchCommodities();

    }, [])
  );


  const onRefresh = () => {

    setRefreshing(true);
    fetchCommodities();

  };


  const deleteCommodity = (id) => {

    Alert.alert(
      "Delete",
      "Are you sure?",
      [
        {
          text:"Cancel",
          style:"cancel"
        },
        {
          text:"Delete",
          style:"destructive",

          onPress: async () => {

            await fetch(
              API + '/commodities/' + id,
              {
                method:"DELETE",
                headers:{
                  Authorization:
                    'Bearer ' + token
                }
              }
            );

            fetchCommodities();

          }
        }
      ]
    );

  };


  if (loading) {

    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#e94560"
        />
      </View>
    );

  }


  return (

    <View style={styles.container}>


      <View style={styles.header}>

        <Text style={styles.title}>
          My Vault
        </Text>


        <TouchableOpacity onPress={logout}>

          <Text style={styles.logout}>
            Logout
          </Text>

        </TouchableOpacity>

      </View>



      <TouchableOpacity
        style={styles.addButton}
        onPress={() =>
          navigation.navigate('AddCommodity')
        }
      >

        <Text style={styles.addButtonText}>
          + Add Holding
        </Text>

      </TouchableOpacity>



      <FlatList

        data={commodities}

        keyExtractor={
          item =>
            item.id.toString()
        }


        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e94560"
          />
        }


        renderItem={({item}) => {

          const totalWeight =
            (item.quantity * item.weight_oz).toFixed(4);

          const spot =
            Number(
              spotPrices?.[item.metal]?.oz || 0
            );

        const currentValue =
          Number(item.quantity) *
          Number(item.weight_oz) *
          spot;

        const gain =
          currentValue -
          Number(item.total_cost);

        const returnPct =
          item.total_cost > 0
            ? (gain / item.total_cost) * 100
            : 0;


          return (

          <View style={styles.card}>


            <View style={styles.cardHeader}>

              <Text style={styles.cardTitle}>
                {item?.name || "Unknown Product"}
              </Text>


              <Text style={styles.cardCost}>
                Cost: ${Number(item.total_cost).toFixed(2)}
              </Text>

            </View>



            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>
                Quantity
              </Text>

              <Text style={styles.cardValue}>
                {item.quantity}
              </Text>
            </View>



            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>
                Metal
              </Text>

              <Text style={styles.cardValue}>
                {item?.metal || "Unknown"}
              </Text>
            </View>



            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>
                Purity
              </Text>

              <Text style={styles.cardValue}>
                {item?.purity || "Unknown"}
              </Text>
            </View>



            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>
                Weight Each
              </Text>

              <Text style={styles.cardValue}>
                {item?.weight_oz || "?"} oz
              </Text>
            </View>



            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>
                Total Weight
              </Text>

              <Text style={styles.cardValue}>
                {totalWeight || "?"} oz
              </Text>
            </View>

            <View style={styles.cardRow}>

              <Text style={styles.cardLabel}>
                Current Value
              </Text>

              <Text
                style={[
                  styles.cardValue,
                  { color: "#4ecca3" }
                ]}
              >
                ${currentValue.toFixed(2)}
              </Text>

            </View>

            <View style={styles.cardRow}>

              <Text style={styles.cardLabel}>
                Gain / Loss
              </Text>

              <Text
                style={[
                  styles.cardValue,
                  {
                    color:
                      gain >= 0
                        ? "#4ecca3"
                        : "#e94560",
                    fontWeight: "bold"
                  }
                ]}
              >
                {gain >= 0 ? "+" : ""}
                ${gain.toFixed(2)}
              </Text>

            </View>

            <View style={styles.cardRow}>

              <Text style={styles.cardLabel}>
                Return
              </Text>

              <Text
                style={[
                  styles.cardValue,
                  {
                    color:
                      returnPct >= 0
                        ? "#4ecca3"
                        : "#e94560",
                    fontWeight: "bold"
                  }
                ]}
              >
                {returnPct >= 0 ? "+" : ""}
                {returnPct.toFixed(2)}%
              </Text>

            </View>



            {item?.mint ? (

              <View style={styles.cardRow}>

                <Text style={styles.cardLabel}>
                  Mint
                </Text>

                <Text style={styles.cardValue}>
                  {item.mint}
                </Text>

              </View>

            ) : null}



            {item?.country ? (

              <View style={styles.cardRow}>

                <Text style={styles.cardLabel}>
                  Country
                </Text>

                <Text style={styles.cardValue}>
                  {item.country}
                </Text>

              </View>

            ) : null}



            <View style={styles.cardRow}>

              <Text style={styles.cardLabel}>
                Purchased
              </Text>

              <Text style={styles.cardValue}>
                {item.date}
              </Text>

            </View>



            {item.notes ? (

              <View style={styles.cardRow}>

                <Text style={styles.cardLabel}>
                  Notes
                </Text>

                <Text style={styles.cardValue}>
                  {item.notes}
                </Text>

              </View>

            ) : null}



            <View style={styles.cardActions}>


              <TouchableOpacity
                style={styles.editBtn}
                onPress={() =>
                  navigation.navigate(
                    'AddCommodity',
                    {item}
                  )
                }
              >

                <Text style={styles.editBtnText}>
                  Edit
                </Text>

              </TouchableOpacity>



              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() =>
                  deleteCommodity(item.id)
                }
              >

                <Text style={styles.deleteBtnText}>
                  Delete
                </Text>

              </TouchableOpacity>


            </View>


          </View>

          );

        }}

      />


    </View>

  );
}



const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:'#1a1a2e',
    padding:16
  },


  center:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#1a1a2e'
  },


  header:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    marginBottom:16,
    marginTop:40
  },


  title:{
    color:'#e94560',
    fontSize:22,
    fontWeight:'bold'
  },


  logout:{
    color:'#e94560',
    borderWidth:1,
    borderColor:'#e94560',
    padding:6,
    borderRadius:6
  },


  addButton:{
    backgroundColor:'#e94560',
    padding:14,
    borderRadius:10,
    alignItems:'center',
    marginBottom:16
  },


  addButtonText:{
    color:'#fff',
    fontWeight:'bold'
  },


  card:{
    backgroundColor:'#16213e',
    borderRadius:12,
    padding:16,
    marginBottom:12
  },


  cardHeader:{
    flexDirection:'row',
    justifyContent:'space-between'
  },


  cardTitle:{
    color:'#eee',
    fontSize:16,
    fontWeight:'bold'
  },


  cardCost:{
    color:'#4ecca3',
    fontWeight:'bold'
  },


  cardRow:{
    flexDirection:'row',
    justifyContent:'space-between',
    marginTop:6
  },


  cardLabel:{
    color:'#888'
  },


  cardValue:{
    color:'#eee'
  },


  cardActions:{
    flexDirection:'row',
    justifyContent:'flex-end',
    marginTop:12
  },


  editBtn:{
    backgroundColor:'#0f3460',
    padding:8,
    borderRadius:6,
    marginRight:8
  },


  deleteBtn:{
    backgroundColor:'#e94560',
    padding:8,
    borderRadius:6
  },


  editBtnText:{
    color:'#fff'
  },


  deleteBtnText:{
    color:'#fff'
  }

});