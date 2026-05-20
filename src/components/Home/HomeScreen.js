import { createStackNavigator } from "react-navigation";
import React, { Component } from "react";
import {
  BackHandler,
  StatusBar,
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  Dimensions,
  PixelRatio,
  TouchableOpacity,
  LogBox
} from "react-native";
import OfflineNotice from "../../Utility/OfflineNotice";
import * as utilities from "../../Utility/utilities";
import * as app from "../../App";
import SplashScreen from 'react-native-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Suppress known third-party deprecated warnings (e.g. native-base currentlyFocusedField)
LogBox.ignoreLogs([
  'currentlyFocusedField is deprecated',
  'Warning: componentWillMount',
  'Warning: componentWillReceiveProps',
]);

export var LAT = "";
export var LONG = "";
export var LOC_ERROR = "";

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      latitude: null,
      longitude: null,
      locationError: null
    };
  }

  // REMOVED componentWillMount — it was deprecated and empty, no logic was inside it.

  componentDidMount() {
    SplashScreen.hide();
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);

    // Geolocation example (commented out in original — kept for reference, bug fixed below)
    // navigator.geolocation.getCurrentPosition(
    //   position => {
    //     this.setState({
    //       latitude: position.coords.latitude,
    //       longitude: position.coords.longitude, // BUG FIX: was position.coords.latitude (copy-paste bug)
    //       locationError: null
    //     });
    //     LAT = position.coords.latitude;
    //     LONG = position.coords.longitude; // BUG FIX: was position.coords.latitude
    //     LOC_ERROR = null;
    //     console.log(LAT + " : " + LONG + " : " + LOC_ERROR);
    //   },
    //   error => {
    //     this.setState({ locationError: error.message });
    //     LOC_ERROR = error.message;
    //   },
    //   { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    // );

    this.getUserdata();
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
  }

  handleBackPress = () => {
    BackHandler.exitApp();
    return true;
  };

  async getUserdata() {
    try {
      await AsyncStorage.multiGet(["USERDATA"], (err, result) => {
        if (err) {
          console.log("AsyncStorage error:", err);
          return;
        }

        // BUG FIX: Added null/undefined guard before JSON.parse
        if (!result || !result[0] || !result[0][1]) {
          console.log("No USERDATA found in AsyncStorage.");
          return;
        }

        var lData = JSON.parse(result[0][1]);

        console.log(result);
        if (lData) {
          if (lData.user_type == "1") {
            this.props.navigation.navigate("VerifierMainScreen");
          } else if (lData.user_type == "2") {
            this.props.navigation.navigate("InstituteMainScreen");
          } else if (lData.hasOwnProperty("student_id") && lData.student_id) {
            this.props.navigation.navigate("DocumentListScreen");
          }
        }
      });
    } catch (error) {
      console.log("getUserdata error:", error);
    }
  }

  _onPressButton(pLoginType) {
    this.props.navigation.navigate(pLoginType, { LAT: LAT, LONG: LONG });
  }

  render() {
    return (
      <View style={styles.container}>
        <OfflineNotice />
        <StatusBar backgroundColor="#0000FF" barStyle="light-content" />
        <View style={{ flex: 0.9 }}>
          <View style={styles.containerLevel1}>
            <Text
              style={{
                textAlign: "center",
                fontSize: 20,
              }}
            >
              {/* <Text style={{ color: "#0000FF" }}>DC </Text> */}
              <Text style={{ color: "#0000FF" }}>Food Security Card </Text>
            </Text>
          </View>
        </View>

        <View style={{}}>
          <Image
            style={{ width: 200, height: 200, }}
            resizeMode="contain"
            source={require("../../images/wwe.png")}
          />
        </View>

        <View style={{ flex: 1, marginTop: 20 }}>
          <TouchableOpacity
            onPress={() => this._onPressButton("VerifierLoginScreen")}
          >
            <View style={styles.buttonVerifier}>
              <Text style={styles.buttonText}>SIGN IN AS VERIFIER</Text>
            </View>
          </TouchableOpacity>
          {/* <TouchableOpacity
            onPress={() => this._onPressButton("StudentLoginScreen")}
          >
            <View style={styles.buttonStudent}>
              <Text style={styles.buttonText}>STUDENT LOGIN</Text>
            </View>
          </TouchableOpacity> */}
          <TouchableOpacity
            onPress={() => this._onPressButton("InstitueLoginScreen")}
          >
            <View style={styles.buttonInstitute}>
              <Text style={styles.buttonText}>SIGN IN AS DEPARTMENT</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "#F5FCFF",
    backgroundColor: "#f7f7f7",
    flexDirection: "column"
  },
  containerLevel1: {
    alignItems: "center",
    paddingTop: Dimensions.get("window").width * 0.3
  },
  buttonVerifier: {
    width: 300,
    alignItems: "center",
    backgroundColor: "#0000FF",
    borderRadius: 30
  },
  buttonStudent: {
    marginTop: 10,
    width: 300,
    alignItems: "center",
    borderRadius: 30,
    backgroundColor: "#68228B"
  },
  buttonInstitute: {
    marginTop: 10,
    marginBottom: 30,
    width: 300,
    alignItems: "center",
    borderRadius: 30,
    backgroundColor: "#D34A44"
  },
  buttonText: {
    padding: 15,
    color: "white",
    fontWeight: "bold",
    fontSize: 15
  }
});

// <Text style={{color: '#0000FF', marginLeft: 10, }}>SECURITY SOFTWARE {'\n'}</Text>
//                   <Text style={{color: '#0000FF' }}>SOLUTION LIMITED(SSSL)</Text>