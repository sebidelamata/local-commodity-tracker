import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';

import { useAuth, API } from '../context/AuthContext';

import ProductPicker from './ProductPicker';



export default function AddCommodityScreen({ navigation, route }) {

  const { token } = useAuth();

  const editing = route.params?.item;



  const [date, setDate] = useState('');

  const [product, setProduct] = useState(null);

  const [quantity, setQuantity] = useState('');

  const [totalCost, setTotalCost] = useState('');

  const [purchaseMethod, setPurchaseMethod] = useState('');

  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);

  const [showPicker, setShowPicker] = useState(false);




  useEffect(() => {

    if (editing) {

      setDate(editing.date || '');

      setQuantity(
        String(editing.quantity || '')
      );

      setTotalCost(
        String(editing.total_cost || '')
      );

      setPurchaseMethod(
        editing.purchase_method || ''
      );

      setNotes(
        editing.notes || ''
      );


      if (editing.product_id) {

        setProduct({

          id: editing.product_id,
          name: editing.name,
          category: editing.category,
          metal: editing.metal,
          purity: editing.purity,
          weight_oz: editing.weight_oz,
          weight_grams: editing.weight_grams,
          weight_kg: editing.weight_kg,
          mint: editing.mint,
          country: editing.country,
          denomination: editing.denomination,
          series: editing.series

        });

      }

    }

  }, [editing]);





  const save = async () => {


    if (
      !date ||
      !product ||
      !quantity ||
      !totalCost
    ) {

      Alert.alert(
        "Error",
        "Please select a product and fill all required fields"
      );

      return;

    }



    setLoading(true);



    const body = {

      product_id: product.id,

      date,

      quantity,

      total_cost: totalCost,

      purchase_method: purchaseMethod,

      notes

    };



    const method = editing
      ? "PUT"
      : "POST";



    const url = editing

      ? API + "/commodities/" + editing.id

      : API + "/commodities";





    try {


      const res = await fetch(

        url,

        {

          method,

          headers: {

            "Content-Type":
              "application/json",

            "Authorization":
              "Bearer " + token

          },


          body:
            JSON.stringify(body)

        }

      );



      const data = await res.json();



      if (!res.ok || data.error) {

        Alert.alert(
          "Error",
          data.error || "Request failed"
        );

        return;

      }



      navigation.goBack();



    } catch(err) {


      console.error(
        "Save commodity failed:",
        err
      );


      Alert.alert(
        "Error",
        "Could not connect to server"
      );


    } finally {

      setLoading(false);

    }

  };





  return (

    <>

    <ScrollView

      style={styles.container}

      contentContainerStyle={styles.content}

    >


      <Text style={styles.title}>

        {
          editing
          ? "Edit Vault Entry"
          : "Add Vault Entry"
        }

      </Text>





      <Text style={styles.label}>
        Date *
      </Text>


      <TextInput

        style={styles.input}

        value={date}

        onChangeText={setDate}

        placeholder="YYYY-MM-DD"

        placeholderTextColor="#888"

      />





      <Text style={styles.label}>
        Product *
      </Text>



      {
        product ?


        (

          <TouchableOpacity

            style={styles.selectedProduct}

            onPress={() =>
              setShowPicker(true)
            }

          >

            <Text style={styles.productName}>

              {product.name}

            </Text>



            <Text style={styles.productDetails}>

              {product.metal}

              {" • "}

              {product.purity}

              {" • "}

              {product.weight_oz} oz


            </Text>



            {
              product.mint &&

              <Text style={styles.productDetails}>

                {product.mint}

              </Text>

            }


          </TouchableOpacity>


        )


        :


        (

          <TouchableOpacity

            style={styles.selectButton}

            onPress={() =>
              setShowPicker(true)
            }

          >

            <Text style={styles.selectText}>
              Select Product
            </Text>

          </TouchableOpacity>

        )

      }







      <Text style={styles.label}>
        Quantity *
      </Text>


      <TextInput

        style={styles.input}

        value={quantity}

        onChangeText={setQuantity}

        placeholder="e.g. 10"

        placeholderTextColor="#888"

        keyboardType="decimal-pad"

      />





      <Text style={styles.label}>
        Total Cost *
      </Text>


      <TextInput

        style={styles.input}

        value={totalCost}

        onChangeText={setTotalCost}

        placeholder="e.g. 350.00"

        placeholderTextColor="#888"

        keyboardType="decimal-pad"

      />





      <Text style={styles.label}>
        Purchase Method
      </Text>


      <TextInput

        style={styles.input}

        value={purchaseMethod}

        onChangeText={setPurchaseMethod}

        placeholder="cash, ACH, card..."

        placeholderTextColor="#888"

      />





      <Text style={styles.label}>
        Notes
      </Text>


      <TextInput

        style={[
          styles.input,
          styles.textarea
        ]}

        value={notes}

        onChangeText={setNotes}

        placeholder="Optional notes"

        placeholderTextColor="#888"

        multiline

      />





      <TouchableOpacity

        style={styles.button}

        onPress={save}

        disabled={loading}

      >

        {

          loading

          ?

          <ActivityIndicator color="#fff"/>

          :

          <Text style={styles.buttonText}>

            {
              editing
              ? "Update"
              : "Save"
            }

          </Text>

        }


      </TouchableOpacity>





      <TouchableOpacity

        style={styles.cancelButton}

        onPress={() =>
          navigation.goBack()
        }

      >

        <Text style={styles.cancelText}>
          Cancel
        </Text>


      </TouchableOpacity>



    </ScrollView>







    <Modal

      visible={showPicker}

      animationType="slide"

    >

      <View style={styles.modalContainer}>


        <TouchableOpacity

          style={styles.closeButton}

          onPress={() =>
            setShowPicker(false)
          }

        >

          <Text style={styles.closeText}>
            Close
          </Text>


        </TouchableOpacity>




        <ProductPicker

          onSelect={(selected)=>{

            setProduct(selected);

            setShowPicker(false);

          }}

        />


      </View>


    </Modal>


    </>

  );

}







const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:'#1a1a2e'
  },


  content:{
    padding:20,
    paddingTop:60,
    paddingBottom:120,
  },


  title:{
    color:'#e94560',
    fontSize:22,
    fontWeight:'bold',
    marginBottom:20
  },


  label:{
    color:'#888',
    fontSize:13,
    marginBottom:4
  },


  input:{
    backgroundColor:'#16213e',
    color:'#eee',
    padding:12,
    borderRadius:8,
    marginBottom:14
  },


  textarea:{
    height:80,
    textAlignVertical:'top'
  },


  selectButton:{
    backgroundColor:'#16213e',
    padding:14,
    borderRadius:8,
    marginBottom:14
  },


  selectText:{
    color:'#eee'
  },


  selectedProduct:{
    backgroundColor:'#16213e',
    padding:14,
    borderRadius:8,
    marginBottom:14
  },


  productName:{
    color:'#eee',
    fontSize:16,
    fontWeight:'bold'
  },


  productDetails:{
    color:'#aaa',
    marginTop:4
  },


  button:{
    backgroundColor:'#e94560',
    padding:14,
    borderRadius:10,
    alignItems:'center'
  },


  buttonText:{
    color:'#fff',
    fontWeight:'bold'
  },


  cancelButton:{
    padding:14,
    alignItems:'center'
  },


  cancelText:{
    color:'#888'
  },



  modalContainer:{
    flex:1,
    backgroundColor:'#1a1a2e',
    padding:20,
    paddingTop:60
  },


  closeButton:{
    backgroundColor:'#e94560',
    padding:12,
    borderRadius:8,
    alignItems:'center',
    marginBottom:12
  },


  closeText:{
    color:'#fff',
    fontWeight:'bold'
  }

});