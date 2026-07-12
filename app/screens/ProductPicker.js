import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator
} from 'react-native';

import { useAuth, API } from '../context/AuthContext';



export default function ProductPicker({ onSelect }) {


  const { token } = useAuth();


  const [products, setProducts] = useState([]);

  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState('');

  const [category, setCategory] = useState('All');

  const [loading, setLoading] = useState(true);




  useEffect(() => {

    fetchProducts();

  }, []);





  const fetchProducts = async () => {

    try {


      const res = await fetch(

        API + '/products',

        {

          headers: {

            Authorization:
              'Bearer ' + token

          }

        }

      );


      const data = await res.json();



      if (Array.isArray(data)) {

        setProducts(data);

        setFiltered(data);

      } else {

        console.error(
          "Products API error:",
          data
        );

        setProducts([]);

        setFiltered([]);

      }


    } catch(err) {


      console.error(
        "Product fetch failed",
        err
      );


      setProducts([]);

      setFiltered([]);


    } finally {

      setLoading(false);

    }

  };





  const filterProducts = (

    text,

    selectedCategory = category

  ) => {


    setSearch(text);



    let result = [...products];



    if (selectedCategory !== "All") {


      result = result.filter(

        item =>
          item.category === selectedCategory

      );


    }





    if (text) {


      const lower =
        text.toLowerCase();



      result = result.filter(item => {



        const searchable = [

          item.name,

          item.metal,

          item.mint,

          item.country,

          item.series,

          item.category

        ]

        .filter(Boolean)

        .join(" ")

        .toLowerCase();




        return searchable.includes(lower);


      });


    }



    setFiltered(result);


  };





  const changeCategory = (value) => {


    setCategory(value);


    filterProducts(

      search,

      value

    );


  };





  const categories = [

    "All",

    "Coin",

    "Bar",

    "Round",

    "Junk Silver"

  ];





  const renderDetails = (item) => {


    const details = [];


    if (item.metal) {

      details.push(item.metal);

    }


    if (item.purity) {

      details.push(item.purity);

    }


    if (item.weight_oz) {

      details.push(
        `${item.weight_oz} oz`
      );

    }


    return details.join(" • ");


  };





  if (loading) {

    return (

      <View style={styles.loading}>

        <ActivityIndicator
          size="large"
          color="#e94560"
        />

      </View>

    );

  }





  return (

    <View style={styles.container}>


      <TextInput

        style={styles.search}

        placeholder="Search products..."

        placeholderTextColor="#888"

        value={search}

        onChangeText={text =>
          filterProducts(text)
        }

      />





      <View style={styles.categories}>


        {
          categories.map(cat => (

            <TouchableOpacity

              key={cat}

              style={[

                styles.category,

                category === cat &&
                styles.selectedCategory

              ]}


              onPress={() =>
                changeCategory(cat)
              }

            >

              <Text style={styles.categoryText}>

                {cat}

              </Text>


            </TouchableOpacity>


          ))

        }


      </View>






      <FlatList

        data={filtered}


        keyExtractor={item =>
          item.id.toString()
        }


        renderItem={({item}) => (


          <TouchableOpacity

            style={styles.product}

            onPress={() =>
              onSelect(item)
            }

          >


            <Text style={styles.name}>

              {item.name}

            </Text>




            <Text style={styles.details}>

              {renderDetails(item)}

            </Text>





            {
              item.mint &&

              <Text style={styles.details}>

                {item.mint}

              </Text>

            }


          </TouchableOpacity>


        )}


        ListEmptyComponent={

          <Text style={styles.empty}>

            No products found

          </Text>

        }


      />


    </View>

  );

}







const styles = StyleSheet.create({


  container:{

    flex:1

  },



  loading:{

    flex:1,

    justifyContent:'center',

    alignItems:'center'

  },



  search:{

    backgroundColor:'#16213e',

    color:'#eee',

    padding:12,

    borderRadius:8,

    marginBottom:10

  },



  categories:{

    flexDirection:'row',

    flexWrap:'wrap',

    marginBottom:10

  },



  category:{

    backgroundColor:'#16213e',

    paddingVertical:6,

    paddingHorizontal:10,

    borderRadius:15,

    marginRight:6,

    marginBottom:6

  },



  selectedCategory:{

    backgroundColor:'#e94560'

  },



  categoryText:{

    color:'#eee',

    fontSize:12

  },



  product:{

    backgroundColor:'#16213e',

    padding:14,

    borderRadius:8,

    marginBottom:8

  },



  name:{

    color:'#eee',

    fontWeight:'bold',

    fontSize:15

  },



  details:{

    color:'#aaa',

    marginTop:4

  },


  empty:{

    color:'#888',

    textAlign:'center',

    marginTop:20

  }


});