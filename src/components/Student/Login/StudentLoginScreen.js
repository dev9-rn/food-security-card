import React, { Component } from 'react';
import {  ActivityIndicator, BackHandler, StatusBar, Dimensions, Platform, StyleSheet, View, TextInput, Image, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { Container, Header, Left, Body, Right, Content, Card, CardItem, Text, Title, Item, Label, Toast, Icon } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import StudentService from '../../../services/StudentService/StudentService';
// import { LAT, LONG, LOC_ERROR } from '../../../Utility/GeoLocation';
import { ActivityIndicatorUtility } from '../../../Utility/ActivityIndicatorUtility';
import OfflineNotice from '../../../Utility/OfflineNotice';
import Loader from '../../../Utility/Loader';
import * as utilities from '../../../Utility/utilities';
import * as app from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default class StudentLoginScreen extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			isConnected: true,
			enrollmentNo: '',
			password: '',
			borderBottomColorPassword: '#757575',
			borderBottomColorUserName: '#757575',
			loading: false,
			loaderText: 'Logging in...',
		};
	}

	componentWillMount() {
		this.setState({ isConnected: app.ISNETCONNECTED });
	}

	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
		this._showNetErrMsg();
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
	}

	handleBackPress = () => {
		this.setState({ loading: false });
		this.props.navigation.navigate('HomeScreen');
		return true;
	}

	_showNetErrMsg() {
		if (!app.ISNETCONNECTED) {
			utilities.showToastMsg('No network available! Please check the connectivity settings and try again.');
		}
	}

	closeActivityIndicator() {
		setTimeout(() => {
			this.setState({ loading: false });
		});
	}

	validateUserName() {
		let lUserName = this.state.username;
		let res = utilities.checkSpecialChar(lUserName);
		return res;
	}

	async callForAPI() {
		let lEnrollmentNo = this.state.enrollmentNo;
		let lPassword = this.state.password;
		let lDeviceType = Platform.OS;
		// let lat = LAT; // this.state.latitude;
		// let long = LONG; //this.state.longitude;
		// console.log('lat : ' + LAT);
		const formData = new FormData();
		formData.append('enrollno', lEnrollmentNo);
		formData.append('password', lPassword);
		formData.append('device_type', lDeviceType);
		// formData.append('lat', lat);
		// formData.append('long', long);

		console.log(formData);
		var loginApiObj = new StudentService();

		this.setState({ loading: true });

		await loginApiObj.studentLogin(formData);
		var lResponseData = loginApiObj.getRespData();
		this.closeActivityIndicator();
		debugger;
		console.log(lResponseData);
		if (!lResponseData) {
			utilities.showToastMsg('Something went wrong. Please try again later');
		} else if (lResponseData.status == "false") {
			utilities.showToastMsg(lResponseData.message);
		} else if (lResponseData.status == 'true') {
			utilities.showToastMsg('Login as student successful');
			try {
				await AsyncStorage.setItem('USERDATA', JSON.stringify(lResponseData));
				this.props.navigation.navigate('DocumentListScreen');
			} catch (error) {
				console.warn(error);
			}
		} else {
			utilities.showToastMsg('Something went wrong. Please try again later');
		}
	}

	_onPressButton() {
		if (!app.ISNETCONNECTED) {
			utilities.showToastMsg('No network available! Please check the connectivity settings and try again.');
		} else {
			let lEnrollmentNo = this.state.enrollmentNo;
			let lPassword = this.state.password;
			var isValidUName = '';
			var isValidPassword = '';
			if (lEnrollmentNo == '' && lPassword == '') {
				utilities.showToastMsg('Enter enrollment number & password');
			}
			else if (lEnrollmentNo == '') {
				utilities.showToastMsg('Enter enrollment number');
			}
			else if (lPassword == '') {
				utilities.showToastMsg('Enter password');
			} else if (lEnrollmentNo && lPassword) {
				// isValidUName = this.validateUserName();
				// if(isValidUName){
				this.callForAPI();
				// }else{
				// utilities.showToastMsg('Wrong login credentials! Please check and try again');
				// }
			} else {
				alert('Server error');
			}
		}
	}

	_showHeader() {
		if (Platform.OS == 'ios') {
			return (
				<Header style={{ backgroundColor: '#68228B' }}>
					<Left style={{ flex: 0.1 }}>
						<TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
							<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10 }} />
						</TouchableOpacity>
					</Left>
					<Body style={{ flex: 0.9 }}>
						<Title style={{ color: '#FFFFFF' }}>{app.title}</Title>
					</Body>

				</Header>
			)
		} else {
			return (
				<Header style={{ backgroundColor: '#68228B' }}>
					<Left style={{ flex: 0.1 }}>
						<TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
							<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10 }} />
						</TouchableOpacity>
					</Left>
					<Body style={{ flex: 0.9, alignItems: 'center' }}>
						<Title style={{ color: '#FFFFFF', fontSize: 16 }}>{app.title}</Title>
					</Body>

				</Header>
			)
		}
	}

	render() {
		return (
			<View style={styles.container}>

				{this._showHeader()}
				<OfflineNotice />

				<StatusBar
					backgroundColor="#68228B"
					barStyle="light-content"
				/>
				<Loader
					loading={this.state.loading}
					text={this.state.loaderText}
				/>

				<View style={styles.loginViewContainer}>
					<KeyboardAwareScrollView keyboardShouldPersistTaps="always">
						<Card style={styles.cardContainer}>

							<CardItem header style={styles.cardHeader}>
								<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'normal', fontSize: 18 }}>Login</Text>
							</CardItem>

							<View style={{ paddingLeft: 0, paddingRight: 0, marginTop: 10 }}>
								<View style={styles.inputContainer}>

									<TextInput
										style={{
											borderBottomColor: this.state.borderBottomColorUserName,
											...styles.inputs
										}}
										placeholder='Enrollment no'
										onFocus={() => { this.setState({ borderBottomColorUserName: '#68228B' }) }}
										onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
										onChangeText={(enrollmentNo) => this.setState({ enrollmentNo })} />

									<TextInput
										style={{
											borderBottomColor: this.state.borderBottomColorPassword,
											...styles.inputs
										}}
										placeholder='Password'
										secureTextEntry={true}
										onFocus={() => { this.setState({ borderBottomColorPassword: '#68228B' }) }}
										onBlur={() => this.setState({ borderBottomColorPassword: '#757575' })}
										onChangeText={(password) => this.setState({ password })} />

								</View>
							</View>

							<View>
								<TouchableOpacity onPress={() => this._onPressButton()}>
									<View style={styles.buttonVerifier}>
										<Text style={styles.buttonText}>LOGIN</Text>
									</View>
								</TouchableOpacity>

							</View>
						</Card>
					</KeyboardAwareScrollView>

				</View>
			</View>
		)
	}
};


const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	loginViewContainer: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'stretch',
		paddingTop: Dimensions.get('window').height * 0.1
	},
	cardContainer: {
		padding: 15,
		marginTop: 40,
		marginLeft: 30,
		marginRight: 30
	},
	cardHeader: {
		borderBottomWidth: 1,
		borderBottomColor: '#E0E0E0'
	},
	inputContainer: {
		height: 100,
		marginBottom: 15,
		flexDirection: 'column',
		justifyContent: 'space-between',
	},
	inputs: {
		height: 45,
		marginLeft: 5,
		borderBottomWidth: 1,
		flex: 1,
	},
	buttonVerifier: {
		marginTop: 10,
		alignItems: 'center',
		backgroundColor: '#68228B',
		borderRadius: 5
	},
	buttonText: {
		padding: 10,
		color: 'white',
	},
	ActivityContainer: {
		// flex: 1,
		// flexDirection: 'column',
		// justifyContent: 'center',
		// alignItems: 'center',
		// marginTop: 70,
		position: 'absolute',
		top: Dimensions.get('window').height * 0.5,
		left: Dimensions.get('window').width * 0.1,
		// // marginLeft: 20,
		width: Dimensions.get('window').width * 0.8,
		zIndex: 2,
		// // alignItems: 'stretch',
		backgroundColor: 'gray',
		borderRadius: 3
	},
	act: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'stretch',
		// backgroundColor:'yellow',
		// width: Dimensions.get('window').width * 0.8,
		height: 50,
		// zIndex:2
	},
	activityIndicator: {
		flex: 0.2,
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		height: 50,
		// backgroundColor: 'skyblue'
	},
	ActivityIndicatorText: {
		flex: 0.8,
		marginTop: 5,
		fontSize: 14
		// backgroundColor: 'orange'
	}

});
