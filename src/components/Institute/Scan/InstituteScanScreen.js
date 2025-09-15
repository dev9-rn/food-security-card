import React, { Component } from 'react';
import { Alert, BackHandler, Dimensions, Platform, StyleSheet, View, Image, TouchableOpacity, StatusBar, Linking } from 'react-native';
import { Container, Header, Left, Body, Right, Content, Card, CardItem, Text, Title, Item, Icon, Toast } from 'native-base';
import QRCodeScanner from 'react-native-qrcode-scanner';
import AndroidOpenSettings from 'react-native-android-open-settings';
import InstituteService from '../../../services/InstituteService/InstituteService';
// import Torch from 'react-native-torch';
import CustomHeader from '../../../Utility/CustomHeader';
import Loader from '../../../Utility/Loader';
import OfflineNotice from '../../../Utility/OfflineNotice';
import * as utilities from '../../../Utility/utilities';
import * as app from '../../../App';
import NetInfo from "@react-native-community/netinfo";

import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

export default class InstituteScanScreen extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			isConnected: true,
			userId: '',
			userName: '',
			flashEnabled: true,
			flash: false,
			loading: false,
			showCamera: true,
			loaderText: 'Scanning...',
			showCameraText: true,
			token: "",
			decryptedData: '', // Make sure this is initialized
			showLoadingGif: false, // State for loading GIF
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
		this.didFocusSubscription = this.props.navigation.addListener(
			'didFocus',
			payload => {
				this.setState({ showCamera: true });
				// this.scanSuccess = true;
			}
		);
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
		this._showNetErrMsg();
	}

	componentWillUnmount() {
		this.netInfoSubscription();
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
		this.didFocusSubscription.remove();
	}

	handleBackPress = () => {
		this.props.navigation.navigate('InstituteMainScreen');
		return true;
	}

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

	_openSettings() {
		if (Platform.OS == 'ios') {
			Linking.canOpenURL('app-settings:').then(supported => {
				if (!supported) {
					console.log('Can\'t handle settings url');
				} else {
					return Linking.openURL('app-settings:');
				}
			}).catch(err => console.error('An error occurred', err));
		} else {
			AndroidOpenSettings.generalSettings();
		}
	}

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

	closeActivityIndicator() {
		setTimeout(() => {
			this.setState({ loading: false });
		});
	}

	async _getAsyncData() {
		await AsyncStorage.getItem('USERDATA', (err, result) => {		// USERDATA is set on SignUP screen
			var lData = JSON.parse(result);
			console.log("institute scan credentials:",result);
			if (lData) {
				this.setState({ userName: lData.institute_username, userId: lData.id, token: lData.access_token });
			}
		});
	}

	onSuccess(e) {
		this.setState({ showCamera: false });
		this._callForAPI(e);
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
		  const instituteApiObj = new InstituteService();
		  this.setState({ loading: true, showCameraText: false });
	  
		  await instituteApiObj.instituteScanViewCertificate(formData, this.state.token);
		  const lResponseData = instituteApiObj.getRespData();
	  
		  await this.closeActivityIndicator();
	  
		  if (!lResponseData) {
			utilities.showToastMsg("Something went wrong. Please try again later");
			this.props.navigation.navigate("InstituteMainScreen");
		  } else if (lResponseData.status === 2) {
			utilities.showToastMsg(lResponseData.data.message);
			this.props.navigation.navigate("InstituteMainScreen");
		  } else if (lResponseData.status === 200) {
			utilities.showToastMsg("QR code scanned successfully.");
			console.log("lResponseData.family_details")
			console.log(lResponseData.ration_details[0]?.family_details)
			await AsyncStorage.setItem("CERTIFICATESCANNEDDATA", JSON.stringify(lResponseData.data));
			await AsyncStorage.setItem("FAMILYDETAILS", JSON.stringify(lResponseData.ration_details[0]?.family_details));
			this.props.navigation.navigate("InstituteCertificateAndPrint", { dataAboveCertificate: decryptedData , family_details: lResponseData.ration_details[0]?.family_details });
		  } else {
			utilities.showToastMsg(lResponseData.message);
			this.props.navigation.navigate("InstituteMainScreen");
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

	_openFlash() {
		if (this.state.flashEnabled) {
			Torch.switchState(true);
			this.setState({ flashEnabled: false });
		} else {
			Torch.switchState(false);
			this.setState({ flashEnabled: true });
		}

	}

	_showHeader() {
		if (Platform.OS == 'ios') {
			return (
				<Header style={{ backgroundColor: '#D34A44' }}>
					<Left style={{ flex: 0.1 }}>
						<TouchableOpacity onPress={() => this.props.navigation.navigate('InstituteMainScreen')}>
							<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
						</TouchableOpacity>
					</Left>
					<Body style={{ flex: 0.9 }}>
						<Title style={{ color: '#FFFFFF' }}>{app.title}</Title>
					</Body>
				</Header>
			)
		} else {
			return (
				<Header style={{ backgroundColor: '#D34A44' }}>
					<Left style={{ flex: 0.1 }}>
						<TouchableOpacity onPress={() => this.props.navigation.navigate('InstituteMainScreen')}>
							<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
						</TouchableOpacity>
					</Left>
					<Body style={{ flex: 0.9, alignItems: 'center' }}>
						<Title style={{ color: '#FFFFFF', fontSize: 16 }}>{app.title}</Title>
					</Body>
				</Header>
			)
		}
	}

	_displayFlashIcon() {
		if (Platform.OS == 'ios') {
			if (this.state.flash) {
				return (
					<TouchableOpacity onPress={() => { this._openFlash(); this.setState({ flash: false }); }} style={{ position: 'absolute', bottom: 50, left: Dimensions.get('window').width * 0.8, zIndex: 1 }}>
						<Image
							style={{ width: 30, height: 30 }}
							source={require('../../../images/flash_on.png')}
						/>
					</TouchableOpacity>
				)
			} else {
				return (
					<TouchableOpacity onPress={() => { this._openFlash(); this.setState({ flash: true }); }} style={{ position: 'absolute', bottom: 50, left: Dimensions.get('window').width * 0.8, zIndex: 1 }}>
						<Image
							style={{ width: 30, height: 30 }}
							source={require('../../../images/flash_off.png')}
						/>
					</TouchableOpacity>
				)
			}
		} else {
			return (null);
		}
	}

	render() {
		const { showCamera, loading, showLoadingGif } = this.state;
		return (
			<Container>
            {this._showHeader()}
            <Content>
                <OfflineNotice />

                {/* Show loading GIF at the top after the header */}
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

                {loading && <Loader loaderText={this.state.loaderText} />}

                {/* Show decrypted data with styling */}
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
            </Content>
        </Container>

		)
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
        borderColor: '#D34A44', // You can adjust the border color
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

 // { this._displayFlashIcon() }