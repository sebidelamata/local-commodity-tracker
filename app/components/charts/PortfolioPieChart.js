import React, {
  useMemo,
  useRef,
  useState,
  useEffect
} from "react";

import {
  View,
  Text,
  Animated,
  Vibration,
  TouchableOpacity,
  StyleSheet
} from "react-native";

import Svg, {
  Path,
  G
} from "react-native-svg";

import {
  getItemMetricValue
} from "../../lib/portfolioMetrics";



export default function PortfolioPieChart({
  data,
  groupBy,
  metric,
  spotPrices,
}) {


  const animated =
    useRef(new Animated.Value(0)).current;


  const [progress,setProgress] =
    useState(1);


  const [selectedIndex,setSelectedIndex] =
    useState(null);





  const chartData = useMemo(()=>{


    const map = {};



    for(const item of data){


      // supports both:
      // item.product.metal
      // item.metal

      const product =
        item.product || item;



      const key =
        product[groupBy] ||
        "Unknown";



      const value =
        getItemMetricValue(
          item,
          metric,
          spotPrices
        );



      if(!value || value <= 0)
        continue;



      if(!map[key]){

        map[key] = {

          label:key,

          value:0

        };

      }



      map[key].value += value;


    }



    return Object.values(map)
      .sort(
        (a,b)=>
          b.value-a.value
      );



  },[
    data,
    groupBy,
    metric,
    spotPrices
  ]);






  const total = useMemo(()=>{


    return (

      chartData.reduce(
        (sum,item)=>
          sum + item.value,
        0
      )

      || 1

    );


  },[
    chartData
  ]);






  useEffect(()=>{


    animated.setValue(0);



    Animated.timing(
      animated,
      {
        toValue:1,
        duration:650,
        useNativeDriver:false
      }
    ).start();



    const listener =
      animated.addListener(
        ({value}) =>
          setProgress(value)
      );



    return ()=>{

      animated.removeListener(listener);

    };


  },[
    data,
    groupBy,
    metric
  ]);






  const size = 240;

  const radius =
    size / 2;

  const innerRadius =
    radius * .62;

  const center =
    radius;





  const colors = [

    "#4ecca3",
    "#e94560",
    "#0f3460",
    "#ffb86b",
    "#7b68ee",
    "#45aaf2",
    "#fd79a8",
    "#f8c291"

  ];






  const createArc = (
    start,
    end,
    rOuter,
    rInner
  )=>{


    const startAngle =
      start * Math.PI * 2;


    const endAngle =
      end * Math.PI * 2;



    const x1 =
      center +
      rOuter *
      Math.cos(startAngle);


    const y1 =
      center +
      rOuter *
      Math.sin(startAngle);



    const x2 =
      center +
      rOuter *
      Math.cos(endAngle);


    const y2 =
      center +
      rOuter *
      Math.sin(endAngle);



    const x3 =
      center +
      rInner *
      Math.cos(endAngle);


    const y3 =
      center +
      rInner *
      Math.sin(endAngle);



    const x4 =
      center +
      rInner *
      Math.cos(startAngle);


    const y4 =
      center +
      rInner *
      Math.sin(startAngle);



    const largeArc =
      end-start > .5
      ? 1
      : 0;



    return `
      M ${x1} ${y1}
      A ${rOuter} ${rOuter}
      0 ${largeArc} 1
      ${x2} ${y2}
      L ${x3} ${y3}
      A ${rInner} ${rInner}
      0 ${largeArc} 0
      ${x4} ${y4}
      Z
    `;

  };







  const slices = useMemo(()=>{


    let acc = 0;



    return chartData.map(item=>{


      const ratio =
        item.value / total;



      const start =
        acc;



      const end =
        acc + ratio;



      acc = end;



      return {

        ...item,

        start,

        end,

        percentage:
          ratio * 100

      };


    });



  },[
    chartData,
    total
  ]);






  const selectSlice = (index)=>{


    setSelectedIndex(

      index === selectedIndex

      ? null

      : index

    );


    Vibration.vibrate(20);

  };






  if(!chartData.length){

    return (

      <View style={styles.empty}>

        <Text style={styles.emptyText}>
          No portfolio data
        </Text>

      </View>

    );

  }







  return (

    <View style={styles.container}>


      <View
        style={{
          width:size,
          height:size
        }}
      >


        <Svg
          width={size}
          height={size}
        >

          <G>

          {
            slices.map((slice,i)=>{


              const animatedEnd =
                slice.start +
                (
                  slice.end -
                  slice.start
                )
                *
                progress;



              const mid =
                (
                  slice.start +
                  animatedEnd
                )
                / 2;



              const selected =
                selectedIndex === i;



              const lift =
                selected
                ? 8
                : 0;



              const dx =
                lift *
                Math.cos(
                  mid *
                  Math.PI *
                  2
                );


              const dy =
                lift *
                Math.sin(
                  mid *
                  Math.PI *
                  2
                );



              return (

                <Path

                  key={slice.label}

                  d={
                    createArc(
                      slice.start,
                      animatedEnd,
                      radius,
                      innerRadius
                    )
                  }


                  fill={
                    colors[
                      i % colors.length
                    ]
                  }


                  opacity={
                    selectedIndex === null ||
                    selected
                    ? 1
                    : .25
                  }


                  transform={
                    `translate(${dx},${dy})`
                  }


                  onPress={()=>
                    selectSlice(i)
                  }


                />


              );


            })

          }


          </G>


        </Svg>






        <View style={styles.center}>


          <Text style={styles.centerValue}>
  {formatMetricValue(
    selectedIndex !== null
      ? slices[selectedIndex].value
      : total,
    metric
  )}
</Text>



          <Text style={styles.centerLabel}>

            {

              selectedIndex !== null

              ?

              slices[selectedIndex]
              .label

              :

              "TOTAL"

            }

          </Text>


        </View>



      </View>






      <View style={styles.legend}>


      {

        slices.map((slice,i)=>(


          <TouchableOpacity

            key={slice.label}

            style={styles.legendRow}

            onPress={()=>
              selectSlice(i)
            }

          >


            <View

              style={[
                styles.dot,
                {
                  backgroundColor:
                  colors[
                    i % colors.length
                  ]
                }
              ]}

            />



            <Text style={styles.legendText}>

              {slice.label}

            </Text>



            <Text style={styles.legendValue}>

              {slice.percentage.toFixed(1)}%

            </Text>



          </TouchableOpacity>


        ))

      }


      </View>



    </View>

  );

}


function formatMetricValue(value, metric){

  const number = Number(value || 0);

  switch(metric){

    case "cost":
      return "$" + number.toFixed(2);

    case "value":
      return "$" + number.toFixed(2);

    case "oz":
      return number.toFixed(2) + " oz";

    case "grams":
      return number.toFixed(1) + " g";

    case "kg":
      return number.toFixed(3) + " kg";

    default:
      return number.toFixed(2);

  }

}



const styles = StyleSheet.create({

container:{
  alignItems:"center",
  marginTop:20
},


center:{
  position:"absolute",
  width:120,
  height:120,
  borderRadius:60,
  backgroundColor:"rgba(22,33,62,.92)",
  alignItems:"center",
  justifyContent:"center",
  left:60,
  top:60
},


centerValue:{
  color:"#4ecca3",
  fontSize:18,
  fontWeight:"bold"
},


centerLabel:{
  color:"#888",
  fontSize:11
},


legend:{
  width:"100%",
  marginTop:20
},


legendRow:{
  flexDirection:"row",
  alignItems:"center",
  marginBottom:8
},


dot:{
  width:12,
  height:12,
  borderRadius:6,
  marginRight:8
},


legendText:{
  color:"#eee",
  flex:1
},


legendValue:{
  color:"#aaa"
},


empty:{
  padding:20,
  alignItems:"center"
},


emptyText:{
  color:"#888"
}

});