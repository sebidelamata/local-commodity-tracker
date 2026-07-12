import React, {
  useState
} from "react";


import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from "react-native";


import {
  useAuth,
  API
} from "../context/AuthContext";



export default function SettingsStack(){

  const { token } = useAuth();



  const [
    currentPassword,
    setCurrentPassword
  ] = useState("");



  const [
    newPassword,
    setNewPassword
  ] = useState("");



  const [
    confirmPassword,
    setConfirmPassword
  ] = useState("");



  const [
    loading,
    setLoading
  ] = useState(false);




  async function changePassword(){


    if(
      newPassword !== confirmPassword
    ){

      Alert.alert(
        "Error",
        "Passwords do not match"
      );

      return;

    }



    if(newPassword.length < 8){

      Alert.alert(
        "Error",
        "Password must be at least 8 characters"
      );

      return;

    }



    try{


      setLoading(true);



      const res =
        await fetch(
          API + "/auth/change-password",
          {
            method:"POST",

            headers:{
              "Content-Type":"application/json",
              Authorization:
                "Bearer " + token
            },

            body:JSON.stringify({

              currentPassword,

              newPassword

            })

          }
        );



      const json =
        await res.json();



      if(!res.ok){

        throw new Error(
          json.error ||
          "Password change failed"
        );

      }



      Alert.alert(
        "Success",
        "Password updated"
      );



      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");



    }
    catch(err){

      Alert.alert(
        "Error",
        err.message
      );

    }
    finally{

      setLoading(false);

    }

  }





  return (

    <ScrollView
      style={styles.container}
    >


      <Text style={styles.title}>
        Settings
      </Text>



      <View style={styles.card}>


        <Text style={styles.section}>
          Change Password
        </Text>



        <TextInput

          placeholder="Current password"

          placeholderTextColor="#777"

          secureTextEntry

          value={currentPassword}

          onChangeText={setCurrentPassword}

          style={styles.input}

        />



        <TextInput

          placeholder="New password"

          placeholderTextColor="#777"

          secureTextEntry

          value={newPassword}

          onChangeText={setNewPassword}

          style={styles.input}

        />



        <TextInput

          placeholder="Confirm new password"

          placeholderTextColor="#777"

          secureTextEntry

          value={confirmPassword}

          onChangeText={setConfirmPassword}

          style={styles.input}

        />



        <TouchableOpacity

          style={styles.button}

          onPress={changePassword}

          disabled={loading}

        >

          <Text style={styles.buttonText}>

            {loading
              ? "Updating..."
              : "Update Password"
            }

          </Text>

        </TouchableOpacity>



      </View>


    </ScrollView>

  );

}





const styles = StyleSheet.create({

container:{
  flex:1,
  backgroundColor:"#1a1a2e",
  padding:16
},


title:{
  color:"#e94560",
  fontSize:26,
  fontWeight:"bold",
  marginBottom:20
},


card:{
  backgroundColor:"#16213e",
  borderRadius:14,
  padding:16
},


section:{
  color:"#fff",
  fontSize:18,
  fontWeight:"bold",
  marginBottom:15
},


input:{
  backgroundColor:"#0f3460",
  color:"#fff",
  borderRadius:10,
  padding:12,
  marginBottom:12
},


button:{
  backgroundColor:"#4ecca3",
  padding:14,
  borderRadius:10,
  alignItems:"center",
  marginTop:10
},


buttonText:{
  color:"#16213e",
  fontWeight:"bold"
}

});