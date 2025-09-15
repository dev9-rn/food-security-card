import React, { Component } from 'react';
import { FlatList, Alert, BackHandler, Dimensions, Platform, StyleSheet, View, TextInput, Image, TouchableOpacity, StatusBar, } from 'react-native';
import { Container, Content, Card, CardItem, Text, Item, Icon, Toast, Tab, Tabs, List, ListItem } from 'native-base';
import Loader from '../../../Utility/Loader';
import * as utilities from '../../../Utility/utilities';
// import { scanSeQRData } from '../../../App';
import VerifierService from '../../../services/VerifierService/VerifierService';



export default class Tab1 extends React.Component {

	constructor(props) {
		super(props);
		console.log("tab1 props:", props.navigation.scanSeQRData);
		//itemData = props.navigation.scanSeQRData;
		this.state = {
			data: [],
			deleteItem: false,
			loading: false,
			loaderText: '',
			show: false,
			userId: '',
			userName: '',
			token: ''
		};
	}

	// async _getAsyncData() {
	// 	await AsyncStorage.getItem('USERDATA', (err, result) => {		// USERDATA is set on SignUP screen
	// 		//  ;
	// 		var lData = JSON.parse(result);
	// 		console.log(result);
	// 		if (lData) {
	// 			this.setState({ userName: lData.username, userId: lData.id, token: lData.access_token });
	// 		}
	// 	});
	// }

	navigateToPAge = (item) => {
		this.props.navigation.navigate("CertificateViewScreen", { certificateData: item, dataAboveCertificate: "" })
	}

	componentDidMount() {
		BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
		// this._getAsyncData();
		setTimeout(() => {
			this.setState({ data: this.props.navigation.scanSeQRData })

		}, 2000);

		console.log(this.state.data.length);

	}

	componentWillUnmount() { BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress); }

	handleBackPress = () => { this.props.navigation.navigate('VerifierMainScreen'); return true; }

	// async _callForAPI(key, scan_by) {
	// 	// console.log("e:", e);
	// 	const formData = new FormData();
	// 	let lUserName = this.state.userName;
	// 	let lUserId = this.state.userId;
	// 	formData.append('key', key);
	// 	formData.append('device_type', Platform.OS);
	// 	formData.append('scanned_by', scan_by);
	// 	formData.append('user_id', lUserId);

	// 	console.log("Form Data", formData);
	// 	var verifierApiObj = new VerifierService();

	// 	this.setState({ loading: true });
	// 	console.log(this.state.token);
	// 	await verifierApiObj.scanByPublicUser(formData, this.state.token);
	// 	var lResponseData = verifierApiObj.getRespData();
	// 	//  ;
	// 	//this.closeActivityIndicator();
	// 	console.log(lResponseData);

	// 	if (!lResponseData) {
	// 		utilities.showToastMsg('Something went wrong. Please try again later');
	// 	} else if (lResponseData.status == 200) {
	// 		if (lResponseData.data.status == '1' && lResponseData.data.publish == '1') {
	// 			try {
	// 				await AsyncStorage.setItem('CERTIFICATESCANNEDDATA', JSON.stringify(lResponseData.data));
	// 				//console.log("my response data:", JSON.stringify(lResponseData.data));
	// 				var lData = {};
	// 				lData = lResponseData;
	// 				// scanSeQRData.unshift(lData);

	// 				this.props.props.navigation.navigate('CertificateViewScreen');
	// 			} catch (error) {
	// 				console.warn(error);
	// 			}
	// 		} else if (lResponseData.data.status == '0') {
	// 			await utilities.showToastMsg(lResponseData.data.message);
	// 			this.props.props.navigation.navigate('VerifierMainScreen')
	// 		} else if (lResponseData.data.status == '2') {
	// 			setTimeout(() => {
	// 				Alert.alert(
	// 					'Scanning Error',
	// 					'Please scan proper QR Code',
	// 					[
	// 						{ text: 'OK', onPress: () => { this.props.navigation.navigate('VerifierMainScreen') }, style: 'destructive' },
	// 					],
	// 					{ cancelable: false }
	// 				)
	// 			}, 500);
	// 		}
	// 	}
	// 	else if (lResponseData.status == 400) {
	// 		utilities.showToastMsg(lResponseData.data.message);
	// 		this.props.navigation.navigate('VerifierMainScreen');
	// 	}

	// 	else {
	// 		utilities.showToastMsg('Something went wrong. Please try again later');
	// 	}
	// }


	_displayList() {
		console.log("=-=-===-=");

		var items = this.props.navigation.scanSeQRData;
		console.log("tab1", items.document_id);
		console.log("tab1", items.date_time);
		console.log("tab1", items.device_type);
		console.log("tab1", items);

		if (items.length == 0) {
			return (
				<View style={styles.noRecord}>
					<Text style={{ fontSize: 28, color: '#BDBDBD' }}>No history available!</Text>
				</View>
			)
		} else {
			return (
				<View>
					<FlatList
						data={items}
						extraData={this.state}
						key={(item, index) => item.index}
						keyExtractor={(item, index) => item.index}
						renderItem={({ item, index }) =>
							<ListItem style={{ flexDirection: 'row', }}
								onPress={() => {
									// this._callForAPI(item.scanned_data, item.scan_by)
									{ this.props.props.navigation.navigate('CertificateViewScreen1', { certificateData: item }); }
								}}
							>
								<View
									style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start' }}
								// onPress={() => { this.props.props.navigation.navigate('CertificateViewScreen', { certificateData: item }); }}
								>
									<View style={{ flex: 0.9, flexDirection: 'row' }}>
										<Text style={{ fontWeight: 'bold' }}>Document No: </Text>
										<Text ellipsizeMode='tail' numberOfLines={1}> {item.document_id.substring(item.document_id.lastIndexOf('/') + 1)}</Text>
									</View>
									<View style={{ flex: 0.9, flexDirection: 'row' }}>
										<Text style={{ fontWeight: 'bold' }}>Scanned on : </Text>
										<Text> {item.date_time}</Text>
									</View>
								</View>
								<View style={{ flex: 1, alignItems: 'flex-end' }}>

									<View><Text></Text></View>
									{item.device_type == 'android' ?
										<TouchableOpacity style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>

											<Image style={{ width: 15, height: 15, }}
												source={require('../../../images/android.png')} />

										</TouchableOpacity>
										:
										item.device_type == 'ios' ?
											<TouchableOpacity style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>

												<Image style={{ width: 15, height: 15, }}
													source={require('../../../images/ios.png')} />

											</TouchableOpacity>
											:
											<TouchableOpacity style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>

												<Image style={{ width: 15, height: 15, }}
													source={require('../../../images/windows.png')} />

											</TouchableOpacity>
									}

								</View>
							</ListItem>
						}
					/>
				</View>
			)
		}
	}

	render() {
		return (
			<View style={styles.container}>

				{this._displayList()}
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,

	},
	noRecord: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center'
	}
});

// <List 
// 	          		dataArray={items}
// 	            	renderRow={(item, sectionID, rowID ) =>

// 	              			<ListItem>
//           						<TouchableOpacity style={{flex:0.9 ,flexDirection: 'row' }} onPress={()=>{ this.props.props.navigation.navigate('CertificateViewScreen', { certificateData: item }); } }>
// 		    	            		<Text>Serial No : {item.serial_no}</Text>		    	            	
// 	              				</TouchableOpacity>
// 	              				<TouchableOpacity style={{ flex: 0.1 }} onPress={()=> { this._deleteRecord(item, rowID) } }>
// 		    	            		<Icon type="MaterialIcons" name="delete" />
// 		              			</TouchableOpacity>
// 		              		</ListItem>

// 		            }>
// 		          	</List>

