import React, { Component } from "react";
import {
  Alert,
  StatusBar,
  BackHandler,
  Dimensions,
  Platform,
  StyleSheet,
  View,
  TextInput,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView
} from "react-native";
import {
  Container,
  Header,
  Left,
  Body,
  Right,
  Content,
  Card,
  CardItem,
  Text,
  Title,
  Item,
  Icon,
  Toast
} from "native-base";
import LoginService from "../../../services/LoginService/LoginService";
import Loader from "../../../Utility/Loader";
import * as utilities from "../../../Utility/utilities";
import * as app from "../../../App";
// import { scanSeQRData } from '../../../App';
import SplashScreen from 'react-native-splash-screen';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger
} from "react-native-popup-menu";

import AsyncStorage from '@react-native-async-storage/async-storage';



export default class VerifierMainScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userName: "",
      borderBottomColorPassword: "#757575",
      borderBottomColorUserName: "#757575",
      loading: false,
      loaderText: "Please wait..."
    };
  }

  componentWillMount() {
    this._getAsyncData();
  }

  componentDidMount() {
    SplashScreen.hide()
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
  }
  
  _removeAccount(){
		// utilities.showToastMsg("Account removed successfully");
		this.props.navigation.navigate('RemoveAccount'); 
	}

  handleBackPress = () => {
    Alert.alert(
      "Closing Activity",
      "Are you sure you want to close this activity?",
      [{ text: "NO" }, { text: "YES", onPress: () => BackHandler.exitApp() }],
      { cancelable: false }
    );

    return true;
  };

  closeActivityIndicator() {
    setTimeout(() => {
      this.setState({ animating: false, loading: false });
    });
  }

  async _getAsyncData() {
    await AsyncStorage.getItem("USERDATA", (err, result) => {
      // USERDATA is set on SignUP screen
      var lData = JSON.parse(result);
      console.log(result);
      if (lData) {
        this.setState({
          userName: lData.username,
          userId: lData.id,
          sessionKey: lData.access_token
        });
      }
    });
  }

  async _callForLogoutAPI() {
    // const formData = new FormData();
    // formData.append("user_id", this.state.userId);
    // formData.append("sesskey", this.state.sessionKey);

    var loginApiObj = new LoginService();
    this.setState({ loading: true, loaderText: "Logging out..." });
    await loginApiObj.logOut(this.state.sessionKey);
    var lResponseData = loginApiObj.getRespData();
    this.closeActivityIndicator();
    console.log(lResponseData);

    if (!lResponseData) {
      utilities.showToastMsg("Something went wrong. Please try again later");
    } else if (lResponseData.status == 200) {
      AsyncStorage.clear();
      app.scanSeQRData.length = 0;
      this.props.navigation.navigate("HomeScreen");
      utilities.showToastMsg("Logged out successfully");
    } else {
      utilities.showToastMsg("Something went wrong. Please try again later");
    }
  }

  _aboutUs() {
    this.props.navigation.navigate("AboutUs", { screen: "VerifierMainScreen" });
  }

  _logOut() {
    if (app.ISNETCONNECTED) {
      this._callForLogoutAPI();
    } else {
      utilities.showToastMsg(
        "No network available! Please check the connectivity settings and try again."
      );
    }
  }

  _openScanner() {
    this.props.navigation.navigate("VerifierScanScreen");
  }

  _showHeader() {
    if (Platform.OS == "ios") {
      return (
        <Header style={{ backgroundColor: "#0000FF" }}>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Title style={{ color: "#FFFFFF", fontSize: 16, textAlign: "center" }}>
              {app.title}
            </Title>
          </View>
          <View style={{ justifyContent: 'center' }}>
            <Menu>
              <MenuTrigger>
                <Image
                  style={{ width: 20, height: 20, paddingRight: 15 }}
                  source={require("../../../images/three_dots.png")}
                />
              </MenuTrigger>
              <MenuOptions>
                <MenuOption
                  onSelect={() => this._aboutUs()}
                  style={{ padding: 15 }}
                >
                  <Text style={{ color: "black" }}>About us</Text>
                </MenuOption>
                <MenuOption 
                  onSelect={() => this._removeAccount()} 
                  style={{ padding: 15 }}>
									  <Text style={{ color: 'red' }}>Remove Account</Text>
								</MenuOption>
                <MenuOption
                  onSelect={() => this._logOut()}
                  style={{ padding: 15 }}
                >
                  <Text style={{ color: "black" }}>Logout</Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
          </View>
        </Header>
      );
    } else {
      return (
        <Header style={{ backgroundColor: "#0000FF" }}>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Title style={{ color: "#FFFFFF", fontSize: 16, textAlign: "center" }}>
              {app.title}
            </Title>
          </View>
          <View style={{ justifyContent: 'center' }}>
            <Menu>
              <MenuTrigger>
                <Image
                  style={{ width: 20, height: 20, paddingRight: 15 }}
                  source={require("../../../images/three_dots.png")}
                />
              </MenuTrigger>
              <MenuOptions>
                <MenuOption
                  onSelect={() => this._aboutUs()}
                  style={{ padding: 15 }}
                >
                  <Text style={{ color: "black" }}>About us</Text>
                </MenuOption>
                <MenuOption 
                  onSelect={() => this._removeAccount()} 
                  style={{ padding: 15 }}>
									  <Text style={{ color: 'red' }}>Remove Account</Text>
								</MenuOption>
                <MenuOption
                  onSelect={() => this._logOut()}
                  style={{ padding: 15 }}
                >
                  <Text style={{ color: "black" }}>Logout</Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
          </View>
        </Header>
      );
    }
  }

  render() {
    return (
      <View style={styles.container}>
        {this._showHeader()}
        <StatusBar barStyle="light-content" />

        <Loader loading={this.state.loading} text={this.state.loaderText} />

        <View>
          <Text style={{ textAlign: "center", paddingTop: 10 }}>
            WELCOME {this.state.userName.toUpperCase()}
          </Text>
        </View>
        <View style={styles.homeViewContainer}>
          <Card style={styles.cardContainer}>
            <TouchableOpacity onPress={() => this._openScanner()}>
              <View style={{ marginTop: 10, alignItems: "center" }}>
                <Image
                  style={{ width: 150, height: 150 }}
                  source={require("../../../images/mob_barcode_blue.png")}
                />
                <Text style={{ padding: 10 }}>SCAN AND VIEW CERTIFICATE</Text>
              </View>
            </TouchableOpacity>
          </Card>
          <Card style={styles.cardContainer}>
            <TouchableOpacity
              onPress={() =>
                this.props.navigation.navigate("VerifierHistoryScreen")
              }
            >
              <View style={{ marginTop: 10, alignItems: "center" }}>
                <Image
                  style={{ width: 150, height: 150 }}
                  source={require("../../../images/mob_barcode_history.png")}
                />
                <Text style={{ padding: 10 }}>VIEW HISTORY</Text>
              </View>
            </TouchableOpacity>
          </Card>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  homeViewContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "stretch",
    paddingTop: Dimensions.get("window").height * 0.01
  },
  cardContainer: {
    flex: 1,
    padding: 15,
    marginBottom: 10,
    marginLeft: 30,
    marginRight: 30,
    justifyContent: "center"
  },
  buttonVerifier: {
    marginTop: 10,
    alignItems: "center",
    backgroundColor: "#0000FF",
    borderRadius: 5
  },
  buttonText: {
    padding: 10,
    color: "white"
  }
});
const drawerStyles = {
  drawer: { shadowColor: "#000000", shadowOpacity: 0.8, shadowRadius: 3 },
  main: { paddingLeft: 3 }
};

// <Drawer
//         		ref={(ref) => this._drawer = ref}
//         		styles={drawerStyles}
//         		tapToClose={true}
//         		openDrawerOffset={200}

// 		        content={<SideMenu />}
// 		        tweenHandler={(ratio) => ({ main: { opacity:(2-ratio)/2 } })}
// 		        >
//
