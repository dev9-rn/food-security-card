import React, { Component } from "react";
import { Alert, StatusBar, BackHandler, Dimensions, Image, Platform, StyleSheet, View, TouchableOpacity } from "react-native";
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
      let someText = e.data.trim(); // Cleans up any leading/trailing spaces
      console.log("Scanned text:", someText);
    
      let extractedKey = "";
      let decryptedData = "";
    
      // Extract key from QR code based on the format
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
    
      console.log("Extracted Key:", extractedKey);
    
      // Apply decryption logic
      decryptedData = this.useEncryptedText(extractedKey);
      console.log("Decrypted Key:", decryptedData);
    
      // Handle online case
      if (netInfo.isConnected) {
        console.log("Device is online, proceeding with API call...");
    
        const formData = new FormData();
    
        // Check if decryption failed
        if (decryptedData === "Decryption failed") {
          console.log("Decryption failed, using someText as key");
          formData.append('key', e.data.trim()); // Use the original scanned text in 'key'
        } else {
          console.log("Decryption succeeded, extracting last line for key");
    
          // Extract the last line of the decrypted data
          const lines = decryptedData.split('\n');
          const lastLine = lines[lines.length - 1].trim(); // Trim any spaces or newlines
    
          console.log("Last line extracted as key:", lastLine);
    
          formData.append('key', lastLine); // Use the last line as the key
          formData.append('plain_text', lastLine); // Use the last line as the plain_text
        }
    
        formData.append("device_type", Platform.OS);
        formData.append("scanned_by", this.state.userName);
        formData.append("user_id", this.state.userId);
    
        console.log("FormData prepared for API call:", formData);
    
        // Make API call
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
          this.props.navigation.navigate("VerifierCertificateAndPrint", {
            certificateData: lResponseData.data,
            dataAboveCertificate: decryptedData,
            family_details: lResponseData.ration_details[0]?.family_details
          });
        } else {
          utilities.showToastMsg(lResponseData.message);
          setTimeout(() => {
            this.props.navigation.navigate("VerifierMainScreen");
          }, 1000);
        }
    
      } else {
        console.log("Device is offline, displaying QR text.");
        utilities.showToastMsg("Device is offline. Displaying QR content.");
       
        const decryptedOfflineData = decryptedData === "Decryption failed" ? "Data Not Found" : decryptedData;
       
        console.log("Decrypted offline data before setting state:", decryptedOfflineData);
       
        this.setState({ decryptedData: decryptedOfflineData, showLoadingGif: true }, () => {
          console.log("State updated with decrypted data (offline):", this.state.decryptedData);
        });
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
    const { showCamera, loading, showLoadingGif } = this.state;
    return (
      <View style={styles.container}>
        {this._showHeader()}
        <StatusBar barStyle="light-content" />
        {this.state.loading && (
    <Loader loading={this.state.loading} text={this.state.loaderText} />
)}

{showLoadingGif && (
                    <View style={styles.loadingContainer}>
                        <Image
                            source={require('../../../images/check-mark.png')} // Update with the path to your GIF
                            style={styles.loadingGif}
                        />
                    </View>
                )}

        {showCamera && (
                    <View style={styles.qrScanner}>
                        <QRCodeScanner
                            onRead={this.onSuccess.bind(this)}
                            cameraStyle={{ height: 700 }}
							showMarker={true}
                        />
                    </View>
                )}
        {/* Display Decrypted Data if available and the device is offline */}
        {!this.state.isConnected && this.state.decryptedData ? (
                    <View style={styles.dataContainer}>
                        <Text style={styles.dataText}>
                            Data: 
                            {this.state.decryptedData !== 'Data Not Found' ? (
                                this.state.decryptedData.split('\n').slice(0, -1).join('\n') // Show everything except the last line
                            ) : (
                                this.state.decryptedData
                            )}
                        </Text>
                    </View>
                ) : null}

        {/* {this.state.showCameraText ? (<View> <Text style={{ position: "absolute", bottom: 50, left: Dimensions.get("window").width * 0.1, zIndex: 1, color: "#FFFFFF" }}> Point the camera at QR code. </Text> </View>) : (<View />)}  */}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
      flex: 1,
  },
  loadingContainer: {
      marginVertical: 10,
      justifyContent: 'center',
      alignItems: 'center',
  },
  loadingGif: {
      width: 100,
      height: 100,
      resizeMode: 'contain', // Make sure GIF maintains its aspect ratio
  },
  dataContainer: {
      borderWidth: 1,
      borderColor: '#0000FF', // You can adjust the border color
      borderRadius: 10,
      padding: 15,
      margin: 20, // Add margin for spacing
      backgroundColor: '#FFFFFF', // White background for contrast
      elevation: 3, // For Android shadow effect
      shadowColor: '#000', // For iOS shadow effect
      shadowOffset: {
          width: 0,
          height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
  },
  dataText: {
      color: '#000',
      fontSize: 16, // Adjust font size as needed
  },
  qrScanner: {
      // Your existing QR scanner styles, if any
  },
});