import React, { useMemo } from "react";

import {
  View,
  Text,
  StyleSheet
} from "react-native";


export default function PriceTickerBanner({
  spotPrices = {},
  history = {}
}) {


  const gold =
    spotPrices.gold?.price || 0;


  const silver =
    spotPrices.silver?.price || 0;



  const goldChange =
    calculateChange(
      gold,
      history.gold
    );


  const silverChange =
    calculateChange(
      silver,
      history.silver
    );



  return (

    <View style={styles.container}>


      <PriceCard

        label="GOLD"

        price={gold}

        change={goldChange}

        color="#ffb86b"

      />



      <PriceCard

        label="SILVER"

        price={silver}

        change={silverChange}

        color="#c0c0c0"

      />


    </View>

  );

}



function PriceCard({
  label,
  price,
  change,
  color
}) {


  const changeColor =
    change > 0
      ? "#4ecca3"
      : change < 0
        ? "#e94560"
        : "#888";



  return (

    <View
      style={[
        styles.card,
        {
          borderColor: color
        }
      ]}
    >

      <Text
        style={[
          styles.label,
          {
            color
          }
        ]}
      >
        {label}
      </Text>



      <Text style={styles.price}>

        $
        {Number(price || 0)
          .toLocaleString(
            "en-US",
            {
              minimumFractionDigits:2,
              maximumFractionDigits:2
            }
          )}

      </Text>



      <Text
        style={[
          styles.change,
          {
            color: changeColor
          }
        ]}
      >

        {change === null
          ? "--"
          :
          `${change > 0 ? "+" : ""}${change.toFixed(2)}%`
        }

      </Text>


    </View>

  );

}





function calculateChange(
  current,
  history
) {


  /*
    Expected history:

    {
      current:
      {
        price:4000
      },

      previous:
      {
        price:3950
      }
    }

    or:

    [
      {date:"...",price:3950},
      {date:"...",price:4000}
    ]

  */


  if(!history)
    return null;



  let previous;



  if(Array.isArray(history)){


    if(history.length < 2)
      return null;


    previous =
      history[
        history.length - 2
      ].price;


  }
  else{


    previous =
      history.previous?.price;


  }



  if(!previous)
    return null;



  return (
    (
      current -
      previous
    )
    /
    previous
  )
  *
  100;

}





const styles = StyleSheet.create({

container:{
  flexDirection:"row",
  justifyContent:"space-between",
  marginBottom:16
},


card:{
  width:"48%",
  backgroundColor:"#16213e",
  borderWidth:1,
  borderRadius:14,
  padding:14,
  alignItems:"center"
},


label:{
  fontSize:12,
  fontWeight:"bold",
  letterSpacing:1
},


price:{
  color:"#fff",
  fontSize:20,
  fontWeight:"bold",
  marginTop:5
},


change:{
  marginTop:4,
  fontSize:13,
  fontWeight:"600"
}

});