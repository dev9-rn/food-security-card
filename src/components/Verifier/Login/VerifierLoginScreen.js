import React, { Component } from 'react';
import { Alert, StatusBar, BackHandler, Dimensions, Platform, Button, StyleSheet, View, TextInput, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Container, Header, Left, Body, Right, Content, Card, CardItem, Text, Title, Item, Label, Toast, Icon } from 'native-base';
import LoginService from '../../../services/LoginService/LoginService';
// import { LAT, LONG, LOC_ERROR } from '../../../Utility/GeoLocation';
import { URL, HEADER, APIKEY } from '../../../App';
import OfflineNotice from '../../../Utility/OfflineNotice';
import Loader from '../../../Utility/Loader';
import * as utilities from '../../../Utility/utilities';
import * as app from '../../../App';
import Modal from "react-native-modal";
import { Col, Grid } from "react-native-easy-grid";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class VerifierLoginScreen extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			username: '',
			password: '',
			borderBottomColorPassword: '#757575',
			borderBottomColorUserName: '#757575',
			loading: false,
			loaderText: 'Logging in...',
			modalVisible: false,
			isModalVisible: false,
			isForgot: false,
		};
	}

	toggleModal = () => {
		this.setState({ isModalVisible: !this.state.isModalVisible });
	};

	componentDidMount() {
		console.log(this.props);
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
	}

	handleBackPress = () => {
		this.props.navigation.navigate('HomeScreen');
		return true;
	}
	setModalVisible(visible) { this.setState({ modalVisible: visible }); 
	console.log("Modal")}
	showToastMsg = (msg) => {
		Toast.show({
			text: msg,
			style: { position: 'absolute', bottom: 10, left: 10, right: 10, borderRadius: 5, margin: 20 }
		});
	}

	forgotPasswordApi = () => {
		this.setState({ loading: true , loaderText : "Loading ..." })
		console.log("clicked===");
		if (!this.state.email_id) {
			this.setState({ loading: false })
			utilities.showToastMsg('Email cannot be empty.')
			return;
		} else if (utilities.checkEmail(this.state.email_id)) {
			this.setState({ email_idError: '' })
			const formData = new FormData();
			formData.append('type', 'forgotPassword');
			formData.append('email_id', this.state.email_id);
			formData.append('user_type', 1);
			console.log(formData);
			fetch(`${URL}passwordReset`, {
				method: 'POST',
				headers: {
					'Content-Type': 'multipart\/form-data',
					'Accept': 'application/json',
					'apikey': HEADER.apikey,
				},
				body: formData,
			}).then(res => res.json())
				.then(response => {
					this.setState({ loading: false })
					console.log(response);
					if (response.status == 200) {
						this.toggleModal();
						this.setState({modalVisible: false});
						utilities.showToastMsg(response.message);
						this.props.navigation.navigate('VerifierLoginScreen');
					} else if (response.status == 409) { utilities.showToastMsg(response.message); }
					else if (response.status == 422) { utilities.showToastMsg(response.message); }
					else if (response.status == 400) { utilities.showToastMsg(response.message); }
					else if (response.status == 403) { utilities.showToastMsg(response.message); this.props.navigation.navigate('VerifierLoginScreen') }
					else if (response.status == 405) { utilities.showToastMsg(response.message); }
					else if (response.status == 500) { utilities.showToastMsg(response.message); }
				})
				.catch(error => {
					this.setState({ loading: false })
					console.log(error);
				});
		} else {
			this.setState({ loading: false })
			this.setState({ email_idError: 'Email is not proper.' })
		}
	}


	async closeActivityIndicator() {
		await setTimeout(() => {
			this.setState({ animating: false, loading: false });
		});
	}

	validateUserName() {
		let lUserName = this.state.username;
		let res = utilities.checkSpecialChar(lUserName);
		return res;
	}

	async callForAPI() {
		let lUserName = this.state.username;
		let lPassword = this.state.password;
		let lDeviceType = Platform.OS;
		// console.log('lat : ' + LAT);
		const formData = new FormData();
		formData.append('username', lUserName);
		formData.append('password', lPassword);
		// formData.append('device_type', lDeviceType);
		// formData.append('lat', this.props.navigation.state.params.LAT);
		// formData.append('long', this.props.navigation.state.params.LONG);
		console.log(formData);

		var loginApiObj = new LoginService();

		this.setState({ loading: true });
		await loginApiObj.doLogin(formData);
		var lResponseData = await loginApiObj.getRespData();
		console.log(lResponseData);

		if (lResponseData.status == 200) {
			this.closeActivityIndicator();
			lResponseData.data.loginedBy = "Verifier";
			await AsyncStorage.setItem('USERDATA', JSON.stringify(lResponseData.data));
			this.props.navigation.navigate('VerifierMainScreen');
		} else if (lResponseData.status == 402) {
			this.closeActivityIndicator();
			utilities.showToastMsg(lResponseData.message)
		} else if (lResponseData.status === 400) {
			utilities.showToastMsg(lResponseData.message)
			this.closeActivityIndicator();
		} else {
			utilities.showToastMsg(lResponseData.message)
			this.closeActivityIndicator();
		}

		// if (!lResponseData) {
		// 	this.closeActivityIndicator();
		// 	utilities.showToastMsg('Something went wrong. Please try again later');
		// }
		// else if (lResponseData.status == "false") {
		// 	this.closeActivityIndicator();
		// 	utilities.showToastMsg('Wrong login credentials! Please check and try again');
		// }
		// else if (lResponseData.is_verified == '0' && lResponseData.status == '0') {

		// 	setTimeout(() => {
		// 		Alert.alert(
		// 			'Verify email id',
		// 			'Verify email id and login again to SeQR scan',
		// 			[
		// 				{ text: 'OK' },
		// 			],
		// 			{ cancelable: false }
		// 		);
		// 	})
		// }
		// else if (lResponseData.status == '1') {
		// 	this.closeActivityIndicator();
		// 	utilities.showToastMsg('Login as verifier successful');
		// 	try {
		// 		await AsyncStorage.setItem('USERDATA', JSON.stringify(lResponseData));
		// 		this.props.navigation.navigate('VerifierMainScreen');
		// 	} catch (error) {
		// 		console.log(error);
		// 	}
		// } else {
		// 	this.closeActivityIndicator();
		// 	utilities.showToastMsg('Something went wrong. Please try again later');
		// }
	}

	async _onPressButton() {
		// alert(app.ISNETCONNECTED);
		let lUserName = this.state.username;
		let lPassword = this.state.password;
		var isValidUName = '';
		var isValidPassword = '';
		if (lUserName == '' && lPassword == '') {
			utilities.showToastMsg('Enter user name & password');
			return;
		}
		else if (lUserName == '') {
			utilities.showToastMsg('Enter user name');
			return;
		} else if (lPassword == '') {
			utilities.showToastMsg('Enter password');
		}
		else if (lUserName && lPassword) {
			isValidUName = await this.validateUserName();
			if (isValidUName) {
				this.callForAPI();
			} else {
				utilities.showToastMsg('Wrong login credentials! Please check and try again');
			}
		} else {
			alert('Server error');
		}
	}

	_showOffline() {
		if (!app.ISNETCONNECTED) {
			return (
				<OfflineNotice />
			)
		}
	}

	_showHeader() {
		if (Platform.OS == 'ios') {
			return (
				<Header style={{ backgroundColor: '#0000FF' }}>
					<Left style={{ flex: 0.1 }}>
						<TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
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
				<Header style={{ backgroundColor: '#0000FF' }}>
					<Left style={{ flex: 0.1 }}>
						<TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
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

	render() {
		return (
			<View style={styles.container}>

				{this._showHeader()}
				<OfflineNotice />

				<StatusBar
					barStyle="light-content"
				/>

				<Loader
					loading={this.state.loading}
					text={this.state.loaderText}
				/>

				<View style={styles.loginViewContainer}>
					<ScrollView keyboardShouldPersistTaps="always">
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
										placeholder='Username'
										placeholderTextColor='#757575'
										onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
										onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
										onChangeText={(username) => this.setState({ username })} />

									<TextInput
										style={{
											borderBottomColor: this.state.borderBottomColorPassword,
											...styles.inputs
										}}
										placeholder='Password'
										placeholderTextColor='#757575'
										secureTextEntry={true}
										onFocus={() => { this.setState({ borderBottomColorPassword: '#50CAD0' }) }}
										onBlur={() => { this.setState({ borderBottomColorPassword: '#757575' }); }}
										onChangeText={(password) => this.setState({ password })} />

								</View>
							</View>

							<View>
								<TouchableOpacity onPress={() => this._onPressButton()}>
									<View style={styles.buttonVerifier}>
										<Text style={styles.buttonText}>LOGIN</Text>
									</View>
								</TouchableOpacity>

								<Modal isVisible={this.state.modalVisible}>
									<View style={{ height: 300 }}>
									<Card style={styles.cardContainer}>
										<CardItem header >
											<Text style={{ textAlign:'left', flex: 1,  }}>Forgot Password?</Text>
										<TouchableOpacity onPress={() => { this.setModalVisible(false), this.setState({ email_idError: '', email_id: '' }) }}>
											<Icon type="FontAwesome" name="times" style={{ fontSize: 20, color: 'black', paddingLeft: 13 }} />
										</TouchableOpacity>
                        				</CardItem>
									<View style={{ borderBottomWidth: 1, borderBottomColor: 'grey' }} />
									<View style={{ marginTop: 20 }}>
									<Text>Enter your email address: </Text>
									<TextInput
										placeholder="Email Id"
										style={{ margin: 0, padding: 0, color: '#000000' }}
										selectionColor={this.state.borderBottomColorNewPassword}
										onFocus={() => { this.setState({ borderBottomColorNewPassword: '#800000' }) }}
										onBlur={() => { this.setState({ borderBottomColorNewPassword: '#757575' }); }}
										onChangeText={(email_id) => this.setState({ email_id: email_id })}
									/>
									<View style={{ marginTop: 40 }}>
										<Button onPress={this.forgotPasswordApi} disabled={this.state.email_id ? false : true}  title="Done" />
									</View>
									</View>
								</Card>
								</View>
								</Modal>

								<Grid style={{ marginTop: 10 }}>
										<Col>
											<TouchableOpacity style={{ marginTop: 10, paddingLeft: 10 }}>
												<Text style={{ color: '#1784C7', fontSize: 13 }} onPress={() => this.props.navigation.navigate('SignUpScreen')}>Click here to sign up</Text>
											</TouchableOpacity>
										</Col>
										<Col>
											<TouchableOpacity style={{ marginTop: 10, paddingLeft: 10 }}>
												<Text secureTextEntry={true} style={{ color: 'red', fontSize: 13, textAlign: 'center' }} onPress={() => { this.setModalVisible(true) }}>Forgot password</Text>
											</TouchableOpacity>
										</Col>
									</Grid>

							</View>
						</Card>
					</ScrollView>
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
		color: '#000000',
	},
	buttonVerifier: {
		marginTop: 10,
		alignItems: 'center',
		backgroundColor: '#0000FF',
		borderRadius: 5
	},
	buttonText: {
		padding: 10,
		color: 'white',
	}
})
