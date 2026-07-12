import React, { useMemo } from "react";

import {
  View,
  Text,
  StyleSheet
} from "react-native";

import {
  getItemMetricValue,
  METRICS
} from "../../lib/portfolioMetrics";


export default function PortfolioReturnCard({
  commodities = [],
  spotPrices = {}
}) {


  const metrics = useMemo(()=>{

    let cost = 0;
    let value = 0;


    commodities.forEach(item=>{

      cost += getItemMetricValue(
        item,
        METRICS.COST,
        spotPrices
      );


      value += getItemMetricValue(
        item,
        METRICS.VALUE,
        spotPrices
      );

    });


    const profit =
      value - cost;


    const percent =
      cost > 0
      ? (profit / cost) * 100
      : 0;


    return {
      cost,
      value,
      profit,
      percent
    };


  },[
    commodities,
    spotPrices
  ]);



  const positive =
    metrics.profit >= 0;



  return (

    <View style={styles.card}>


      <Text style={styles.title}>
        PORTFOLIO RETURN
      </Text>



      <View style={styles.row}>

        <View>
          <Text style={styles.label}>
            VALUE
          </Text>

          <Text style={styles.value}>
            ${format(metrics.value)}
          </Text>
        </View>



        <View>
          <Text style={styles.label}>
            COST
          </Text>

          <Text style={styles.value}>
            ${format(metrics.cost)}
          </Text>
        </View>


      </View>



      <View style={styles.returnBox}>


        <Text
          style={[
            styles.return,
            {
              color:
              positive
              ? "#4ecca3"
              : "#e94560"
            }
          ]}
        >

          {positive ? "+" : ""}
          ${format(metrics.profit)}

        </Text>



        <Text
          style={[
            styles.percent,
            {
              color:
              positive
              ? "#4ecca3"
              : "#e94560"
            }
          ]}
        >

          {positive ? "+" : ""}
          {metrics.percent.toFixed(2)}%

        </Text>


      </View>



    </View>

  );

}



function format(value){

  return Number(value || 0)
    .toLocaleString(
      "en-US",
      {
        minimumFractionDigits:2,
        maximumFractionDigits:2
      }
    );

}



const styles = StyleSheet.create({

card:{
  backgroundColor:"#16213e",
  borderRadius:14,
  padding:16,
  marginBottom:16,
  borderWidth:1,
  borderColor:"#0f3460"
},


title:{
  color:"#888",
  fontSize:12,
  letterSpacing:1,
  fontWeight:"bold",
  marginBottom:12
},


row:{
  flexDirection:"row",
  justifyContent:"space-between"
},


label:{
  color:"#888",
  fontSize:11
},


value:{
  color:"#fff",
  fontSize:18,
  fontWeight:"bold",
  marginTop:3
},


returnBox:{
  marginTop:14,
  alignItems:"center"
},


return:{
  fontSize:28,
  fontWeight:"bold"
},


percent:{
  fontSize:16,
  marginTop:2,
  fontWeight:"600"
}

});