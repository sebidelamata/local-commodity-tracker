import React, {
  useState,
  useCallback
} from "react";

import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet
} from "react-native";

import {
  useFocusEffect
} from "@react-navigation/native";

import {
  useAuth,
  API
} from "../context/AuthContext";

import PriceTickerBanner from "../components/charts/PriceTickerBanner";
import PortfolioPieChart from "../components/charts/PortfolioPieChart";
import PortfolioLineChart from "../components/charts/PortfolioLineChart";

import {
  METRICS
} from "../lib/portfolioMetrics";


export default function DashboardScreen(){

  const { token } = useAuth();


  const [commodities,setCommodities] =
    useState([]);


  const [spotPrices,setSpotPrices] =
    useState({});


  const [metric,setMetric] =
    useState(METRICS.COST);


  const [groupBy,setGroupBy] =
    useState("metal");


  const [loading,setLoading] =
    useState(true);



  const fetchDashboard = async()=>{

    try{

      setLoading(true);


      const [
        commoditiesRes,
        pricesRes
      ] =
      await Promise.all([


        fetch(
          API+"/commodities",
          {
            headers:{
              Authorization:"Bearer "+token
            }
          }
        ),


        fetch(
          API+"/prices/spot",
          {
            headers:{
              Authorization:"Bearer "+token
            }
          }
        )

      ]);



      const commoditiesJson =
        await commoditiesRes.json();


      const pricesJson =
        await pricesRes.json();



      setCommodities(
        Array.isArray(commoditiesJson)
        ? commoditiesJson
        : []
      );



      setSpotPrices(
        pricesJson.data || {}
      );


    }
    catch(err){

      console.error(
        "DASHBOARD ERROR",
        err
      );

    }
    finally{

      setLoading(false);

    }

  };




  useFocusEffect(

    useCallback(()=>{

      fetchDashboard();

    },[])

  );



  if(loading){

    return(

      <View style={styles.center}>

        <ActivityIndicator
          size="large"
          color="#e94560"
        />

      </View>

    );

  }



  return(

    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom:50
      }}
    >


      <Text style={styles.title}>
        test
      </Text>
      
      <PriceTickerBanner
        spotPrices={spotPrices}
      />



      <View style={styles.selectorRow}>

      {
        [
          "metal",
          "purity",
          "name"
        ]
        .map(item=>(

          <Text
            key={item}
            onPress={()=>
              setGroupBy(item)
            }
            style={[
              styles.selector,
              groupBy===item &&
              styles.active
            ]}
          >
            {item.toUpperCase()}
          </Text>

        ))
      }

      </View>



      <PortfolioPieChart

        data={commodities}

        groupBy={groupBy}

        metric={metric}

        spotPrices={spotPrices}

      />



      <PortfolioLineChart

        data={commodities}

        groupBy={groupBy}

        metric={metric}

        spotPrices={spotPrices}

      />



    </ScrollView>

  );

}



const styles=StyleSheet.create({

container:{
  flex:1,
  backgroundColor:"#1a1a2e",
  padding:16
},

center:{
  flex:1,
  justifyContent:"center",
  alignItems:"center"
},

title:{
  color:"#e94560",
  fontSize:24,
  fontWeight:"bold"
},

selectorRow:{
  flexDirection:"row",
  justifyContent:"space-around",
  marginVertical:10
},

selector:{
  color:"#888",
  padding:8
},

active:{
  color:"#4ecca3"
}

});