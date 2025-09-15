import React, { Component } from "react";
import { Alert, StatusBar, BackHandler, Dimensions, Platform, StyleSheet, View, TouchableOpacity } from "react-native";
import { Header, Left, Body, Text, Title, Icon, } from "native-base";
import QRCodeScanner from "react-native-qrcode-scanner";
import Loader from "../../../Utility/Loader";
import * as utilities from "../../../Utility/utilities";
import { scanSeQRData, scanQRData, ISNETCONNECTED } from "../../../App";
import VerifierService from '../../../services/VerifierService/VerifierService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as app from '../../../App';
import OfflineNotice from '../../../Utility/OfflineNotice';
import NetInfo from "@react-native-community/netinfo";
import CryptoJS from 'crypto-js';

export default class VerifierScanScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: "",
      userId: "",
      userName: "",
      flashEnabled: true,
      loading: false,
      loaderText: "Scanning...",
      flash: false,
      showCamera: true,
      showCameraText: true,
      isConnected: true,
    };
  }
 
	componentWillMount() {
		this.setState({ isConnected: app.ISNETCONNECTED });
		this._getAsyncData();
	}

  componentDidMount() {
    this.checkConnectivity();
    this.netInfoSubscription = NetInfo.addEventListener(state => {
			this.setState({ isConnected: state.isConnected });
		});
    this.didFocusSubscription = this.props.navigation.addListener("didFocus", payload => { this.setState({ showCamera: true }); });
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
    this._showNetErrMsg();
  }


  componentWillUnmount() { 
    this.netInfoSubscription();
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress); 
    this.didFocusSubscription.remove(); 
  }

  handleBackPress = () => { this.props.navigation.navigate("VerifierMainScreen"); return true; };

  async checkConnectivity() {
		const netInfo = await NetInfo.fetch();
		this.setState({ isConnected: netInfo.isConnected });
	}

  handleConnectivityChange = isConnected => {
		if (isConnected) {
			this.setState({ isConnected });
		} else {
			this.setState({ isConnected });
			this._showNetErrMsg();
		}
	};

  _showNetErrMsg() {
		if (!this.state.isConnected || !app.ISNETCONNECTED) {
			Alert.alert(
				'No network available',
				'Connect to internet to scan SeQR. Without internet you can only scan non secured public QR codes.',
				[
					{ text: 'SETTINGS', onPress: () => { this._openSettings() } },
					{ text: 'BACK', onPress: () => { this.props.navigation.navigate('InstituteMainScreen') } },
					{ text: 'CONTINUE', onPress: () => { this.setState({ isConnected: false }) } },
				],
				{ cancelable: false } 
			)
		}
	}


  async _getAsyncData() {
    await AsyncStorage.getItem("USERDATA", (err, result) => {
      // USERDATA is set on SignUP screen
      var lData = JSON.parse(result);
      console.log("In scan, user credentials:",result);
      if (lData) {
        this.setState({ userName: lData.username, userId: lData.id, token: lData.access_token });
      }
    });
  }

  onSuccess(e) {
    this.setState({ showCamera: false });
    this._callForAPI(e);
    console.log(e)
  }

  useEncryptedText = (encryptedText) => {
		const secretKey = 'AJITNATH'; // This must be the exact key used for encryption
		let decryptedData = '';
	  
		try {
		  // Decrypt the encrypted text
		  const bytes = CryptoJS.AES.decrypt(encryptedText, secretKey);
		  decryptedData = bytes.toString(CryptoJS.enc.Utf8);
	  
		  // Log decrypted value or error
		  if (!decryptedData) {
			throw new Error("Decryption failed or returned empty data.");
		  }
	  
		  console.log("Decrypted data:", decryptedData);
		  this.setState({ decryptedData });
		} catch (error) {
		  console.log("Error decrypting data: ", error.message);
		  decryptedData = "Decryption failed";
		  this.setState({ decryptedData });
		}
	  
		return decryptedData;
	  };

    async _callForAPI(e) {
    const netInfo = await NetInfo.fetch();
    this.setState({ loading: true, showCameraText: false });

    var someText = e.data.replace(/^\s+|\s+$/g, '');
    console.log("sometext:", someText);

    var a = someText.indexOf("\n");
    // var b = someText.substr(0, a - 1);
    var b = someText.substr(0, a);

    var c = someText.substr(a + 1);
    var d = c.indexOf("\n");
    // var f = c.substr(0, d - 1);
    var f = c.substr(0, d);

    var g = c.substr(d + 1);
    var h = g.indexOf("\n");
    // var i = g.substr(0, h - 1);
    var i = g.substr(0, h);

    // console.log("=-=-=-=-=-=-=-=popopopopo-=-=-==-=>>>>>");

    // var j = g.substr(h + 1);
    // var k = j.indexOf("\n");
    // var l = j.substr(0, k);
    // console.log(l);

    // var m = j.substr(k + 1);
    // var n = m.indexOf("\n");
    // var o = m.substr(0, n);
    // console.log(o);

    // var p = o.substr(n + 1);
    // var q = p.indexOf("\n");
    // var r = p.substr(0, q);
    // console.log(r);


    // var obj = {};
    // obj.name = b;
    // obj.enrollmentNo = f;
    // obj.degree = i;
    // obj.pointer = l;
    // obj.keyForPdf = m.replace(/(\r\n|\n|\r)/gm, "");;
    // console.log(obj);

    if (netInfo.isConnected) {
      console.log("Device is online, proceeding with API call...");
  
      // Extract the key and prepare form data as you already did
      const formData = new FormData();
      let extractedKey = "";
  
      if (/\n/.test(someText)) {
          extractedKey = someText.substring(someText.lastIndexOf("\n") + 1);
          someText = someText.substring(0, someText.lastIndexOf("\n"));
      } else if (/\s/.test(someText)) {
          extractedKey = someText.substring(someText.lastIndexOf(" ") + 1);
          someText = someText.substring(0, someText.lastIndexOf(" "));
      } else {
          extractedKey = e.data;
          someText = "";
      }
  
      // Decrypt the key
      const decryptedData = this.useEncryptedText(extractedKey);
      const lines = decryptedData.split('\n');
      const lastLine = lines[lines.length - 1]; 
  
      formData.append('key', lastLine);
  
      if (decryptedData) {
          formData.append('plain_text', decryptedData);
      } else {
          formData.append('plain_text', null);
      }

    formData.append("device_type", Platform.OS);
    formData.append("scanned_by", this.state.userName);
    formData.append("user_id", this.state.userId);

    console.log(formData);

    var verifierApiObj = new VerifierService();
    await verifierApiObj.scanByPublicUser(formData, this.state.token);
    var lResponseData = verifierApiObj.getRespData();
    this.setState({ loading: false, showCameraText: false });
    if (!lResponseData) {
      utilities.showToastMsg("Something went wrong. Please try again later");
      this.props.navigation.navigate("VerifierMainScreen");
    } else if (lResponseData.data.status === 2) {
      utilities.showToastMsg(lResponseData.data.message);
      this.props.navigation.navigate("VerifierMainScreen");
    } else if (lResponseData.status === 200) {
      var lData = {};
      lData = lResponseData.data;
      scanSeQRData.unshift(lData);
      utilities.showToastMsg("QR code scanned successfully.");
      await AsyncStorage.setItem("CERTIFICATESCANNEDDATA", JSON.stringify(lResponseData));
      // if (i) {
      this.props.navigation.navigate("CertificateViewScreen", { certificateData: lResponseData.data, dataAboveCertificate: someText });
      // } else {
      //   this.props.navigation.navigate("CertificateViewScreen", { certificateData: lResponseData.data, dataAboveCertificate: "" });
      // }
    } else {
      utilities.showToastMsg(lResponseData.message);
      setTimeout(() => {
        this.props.navigation.navigate("VerifierMainScreen");
      }, 1000);
    }

  }else {
    console.log("Device is offline, displaying QR text.");
    utilities.showToastMsg("Device is offline. Displaying QR content.");
    
    // Decrypt offline QR data before displaying it
    const decryptedData = this.useEncryptedText(someText);
    console.log("Decrypted offline data:", decryptedData);
    
    // Stop the loader and show decrypted data
    this.setState({ decryptedData: decryptedData || someText, loading: false });
    
    // Exit the function early to prevent further logic execution
    return;
  }

  }
  _showHeader() {
    if (Platform.OS == "ios") {
      return (
        <Header style={{ backgroundColor: "#0000FF" }}>
          <Left style={{ flex: 0.1 }}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate("VerifierMainScreen")} >
              <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: "#FFFFFF", paddingLeft: 10, paddingRight: 10 }} />
            </TouchableOpacity>
          </Left>
          <Body style={{ flex: 0.9 }}>
            <Title style={{ color: "#FFFFFF" }}>{app.title}</Title>
          </Body>
        </Header>
      );
    } else {
      return (
        <Header style={{ backgroundColor: "#0000FF" }}>
          <Left style={{ flex: 0.1 }}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate("VerifierMainScreen")} >
              <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: "#FFFFFF", paddingLeft: 10, paddingRight: 10 }} />
            </TouchableOpacity>
          </Left>
          <Body style={{ flex: 0.9, alignItems: "center" }}>
            <Title style={{ color: "#FFFFFF", fontSize: 16 }}>{app.title}</Title>
          </Body>
        </Header>
      );
    }
  }
  render() {
    return (
      <View style={styles.container}>
        {this._showHeader()}
        <StatusBar barStyle="light-content" />
        {this.state.loading && (
    <Loader loading={this.state.loading} text={this.state.loaderText} />
)}
        {this.state.showCamera ? (<QRCodeScanner onRead={this.onSuccess.bind(this)} cameraStyle={{ width: "100%", height: "100%" }} showMarker={true} />) : (<View />)}
        {!this.state.isConnected && this.state.decryptedData && !this.state.loading && (
    <View style={{ position: 'absolute', top: 100, left: Dimensions.get('window').width * 0.1, zIndex: 1 }}>
        <Text style={{ color: '#000' }}>
            Decrypted Data: {this.state.decryptedData.split('\n').slice(0, -1).join('\n')}
        </Text>
    </View>
)}

        {/* {this.state.showCameraText ? (<View> <Text style={{ position: "absolute", bottom: 50, left: Dimensions.get("window").width * 0.1, zIndex: 1, color: "#FFFFFF" }}> Point the camera at QR code. </Text> </View>) : (<View />)}  */}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});