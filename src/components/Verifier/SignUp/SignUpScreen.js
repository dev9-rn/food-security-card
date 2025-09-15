import React, { Component } from 'react';
import { Alert, StatusBar, BackHandler, Dimensions, Platform, StyleSheet, View, TextInput, Image, TouchableOpacity, ScrollView } from 'react-native';
import {
	Container, Header, Left, Body, Right, Content, Card, CardItem, Text,
	Title, Item, Label, Toast, InputGroup, Input, Icon, Form
} from 'native-base';
import LoginService from '../../../services/LoginService/LoginService';
// import RadioGroup from 'react-native-custom-radio-group';
// import {radioGroupList} from './radioGroupList.js';
import OfflineNotice from '../../../Utility/OfflineNotice';
import Loader from '../../../Utility/Loader';
import * as utilities from '../../../Utility/utilities';
import * as app from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default class SignUpScreen extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			isConnected: true,
			name: '',
			email: '',
			phoneNumber: '',
			userName: '',
			password: '',
			confirmPassword: '',
			verification: '',
			borderBottomColorPassword: '#757575',
			borderBottomColorUserName: '#757575',
			loading: false,
			loaderText: 'Signing you up...',
			nameError: null,
			emailError: null,
			phoneNumberError: null,
			userNameError: null,
			passwordError: null,
			confirmPasswordError: null,
			btnOTP: 'active',
			btnEmail: 'inactive',
		};
	}

	componentWillMount() {
		this.setState({ isConnected: app.ISNETCONNECTED });
	}

	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
		// this._showNetErrMsg();
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
	}

	handleBackPress = () => {
		this.props.navigation.navigate('VerifierLoginScreen');
		return true;
	}

	_showNetErrMsg() {
		if (!this.state.isConnected || !app.ISNETCONNECTED) {
			Alert.alert(
				'No network available',
				'Connect to internet to scan SeQR. Without internet you can only scan non secured public QR codes.',
				[
					{ text: 'SETTINGS', onPress: () => { } },
					{ text: 'BACK', onPress: () => { this.props.navigation.navigate('VerifierMainScreen') } },
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

	_validateName() {
		let lName = this.state.name;
		let res = utilities.checkSpecialChar(lName);
		if (!res) {
			this.setState({ nameError: "Special characters are not allowed." });
		}
		return res;
	}

	_validateEmail() {
		let lEmail = this.state.email;
		let res = utilities.checkEmail(lEmail);
		if (!res) {
			this.setState({ emailError: "This email address is invalid" });
		}
		return res;
	}

	_validateUserName() {
		let lUserName = this.state.userName;
		let res = utilities.checkSpecialChar(lUserName);
		if (!res) {
			this.setState({ userNameError: "Special characters are not allowed." });
		}
		return res;
	}

	_validatePassword() {
		let lPassword = this.state.password;
		let lConfirmPassword = this.state.confirmPassword;
		let result = '';
		if (lPassword.trim().length >= 8 && lConfirmPassword.trim().length >= 8) {
			if (lPassword == lConfirmPassword && lPassword != '') {
				result = true;
			} else {
				res = false;
				this.setState({ confirmPasswordError: "Password mismatch" });
			}
		} else {
			result = false;
			if (lPassword.trim().length < 8) {
				this.setState({ passwordError: "Password is short, min 8 characters." });
			} else {
				this.setState({ confirmPasswordError: "Password is short, min 8 characters." });
			}
		}
		return result;
	}

	_validateMobileNumber() {
		let lPhoneNumber = this.state.phoneNumber;
		let res = '';
		res = utilities.checkMobileNumber(lPhoneNumber);
		if (!res || lPhoneNumber.trim().length < 10) {
			this.setState({ phoneNumberError: "This phone number appears to be invalid." });
		}
		return res;
	}

	async callForAPI() {
		let lName = this.state.name.trim();
		let lEmail = this.state.email.trim();
		let lPhoneNumber = this.state.phoneNumber;
		let lUserName = this.state.userName;
		let lPassword = this.state.password;
		let lVerification = 1;
		if (this.state.btnOTP == 'active') {
			lVerification = 1;		// verify through OTP 
		} else {
			lVerification = 2;		// verify through Email
		}
		const formData = new FormData();
		formData.append('username', lUserName);
		formData.append('fullname', lName);
		formData.append('password', lPassword);
		formData.append('email_id', lEmail);
		formData.append('mobile_no', lPhoneNumber);
		formData.append('verify_by', lVerification);
		// formData.append('action', 'register');

		var loginApiObj = new LoginService();
		// this.props.navigation.navigate('OTPVerification');

		this.setState({ loading: true });
		await loginApiObj.registration(formData);
		var lResponseData = loginApiObj.getRespData();
		console.log(lResponseData);
		this.setState({ loading: false });
		if (lResponseData.status == 200) {
			utilities.showToastMsg(lResponseData.message);
			if (lVerification === 1) {
				await AsyncStorage.setItem('OTPDATA', JSON.stringify(lResponseData.data));
				this.props.navigation.navigate('OTPVerification', lPhoneNumber);
			} else {
				this.props.navigation.navigate('VerifierLoginScreen', lPhoneNumber);
			}
		} else if (lResponseData.status == 400) {
			utilities.showToastMsg(lResponseData.message);
			return;
		} else {
			utilities.showToastMsg(lResponseData.message);
			return;
		}

		// if (!lResponseData) {
		// 	this.closeActivityIndicator();
		// 	utilities.showToastMsg('Something went wrong. Please try again later');
		// } else if (lResponseData.status == false && lResponseData.code == 501) {
		// 	this.closeActivityIndicator();
		// 	this.setState({ phoneNumberError: "Mobile no. already exists" });
		// 	// utilities.showToastMsg('Mobile no. already exists');
		// } else if (lResponseData.status == false && lResponseData.code == 502) {
		// 	this.closeActivityIndicator();
		// 	this.setState({ emailError: "Email ID already exists" });
		// 	// utilities.showToastMsg('Email ID already exists');
		// } else if (lResponseData.status == false && lResponseData.code == 503) {
		// 	this.closeActivityIndicator();
		// 	this.setState({ userNameError: "Username already exists" });
		// 	// utilities.showToastMsg('Username already exists');
		// } else if (lResponseData.status == true && lResponseData.verification_method == '1') {
		// 	this.closeActivityIndicator();
		// 	utilities.showToastMsg('OTP send to your mobile number');
		// 	try {
		// 		await AsyncStorage.setItem('OTPDATA', JSON.stringify(lResponseData));
		// 		this.props.navigation.navigate('OTPVerification');
		// 	} catch (error) {
		// 		console.log(error);
		// 	}
		// } else if (lResponseData.status == true && lResponseData.verification_method == '2') {
		// 	// utilities.showToastMsg('OTP send to your email address');
		// 	setTimeout(() => {
		// 		this.setState({ animating: false, loading: false });
		// 	}, 2000);
		// 	try {
		// 		await AsyncStorage.setItem('OTPDATA', JSON.stringify(lResponseData));
		// 		// this.props.navigation.navigate('OTPVerification');
		// 		Alert.alert(
		// 			'Verify email id',
		// 			'Verify email id and login again to SeQR scan',
		// 			[
		// 				{ text: 'OK', onPress: () => this.props.navigation.navigate(VerifierLoginScreen) },
		// 			],
		// 			{ cancelable: false }
		// 		)
		// 	} catch (error) {
		// 		console.log(error);
		// 	}
		// } else {
		// 	this.closeActivityIndicator();
		// 	utilities.showToastMsg('Something went wrong. Please try again later');
		// }

	}

	_onPressButton() {
		if (!app.ISNETCONNECTED) {
			utilities.showToastMsg('No network available! Please check the connectivity settings and try again.');

		} else {
			let lName = this.state.name;
			let lEmail = this.state.email;
			let lPhoneNumber = this.state.phoneNumber;
			let lUserName = this.state.userName;
			let lPassword = this.state.password;
			let lConfirmPassword = this.state.confirmPassword;
			let lVerification = this.state.verification;
			var isValidName = '';
			var isValidUserName = '';
			var isValidPassword = '';
			var isValidMobileNumber = '';
			var isValidEmail = '';

			;
			if (lName === "") {
				this.setState({ nameError: "Name is required." });
				return;
			} else {
				this.setState({ nameError: null });
			}

			if (lEmail === "") {
				this.setState({ emailError: "Email required." });
				return;
			} else {
				this.setState({ emailError: null });
			}

			if (lPhoneNumber === "") {
				this.setState({ phoneNumberError: "Phone number required." });
				return;
			} else {
				this.setState({ phoneNumberError: null });
			}

			if (lUserName === "") {
				this.setState({ userNameError: "User name required." });
				return;
			} else {
				this.setState({ userNameError: null });
			}

			if (lPassword === "") {
				this.setState({ passwordError: "Password required." });
				return;
			} else {
				this.setState({ passwordError: null });
			}

			if (lConfirmPassword === "") {
				this.setState({ confirmPasswordError: "Confirm password required." });
				return;
			} else {
				this.setState({ confirmPasswordError: null });
			}

			if (this.state.nameError == null && this.state.emailError == null && this.state.phoneNumberError == null && this.state.userNameError == null && this.state.passwordError == null && this.state.confirmPasswordError == null) {
				;
				isValidName = this._validateName();
				isValidUserName = this._validateUserName();
				isValidMobileNumber = this._validateMobileNumber();
				isValidPassword = this._validatePassword();
				isValidEmail = this._validateEmail();

				if (isValidName && isValidEmail && isValidUserName && isValidPassword && isValidMobileNumber) {
					this.callForAPI();
				}

			} else {
				if (lName != "") {
					lName = '';
					isValidName = this._validateName();
				}
				if (lEmail != '') {
					lEmail = '';
					isValidEmail = this._validateEmail();
				}
				if (lPhoneNumber != '') {
					lPhoneNumber = '';
					isValidMobileNumber = this._validateMobileNumber();
				}
				if (lUserName) {
					lUserName = '';
					isValidUserName = this._validateUserName();
				}
				if (lPassword != '') {
					lPassword = '';
					isValidPassword = this._validatePassword();
				}
			}
		}
	}

	_verficationButton() {
		if (this.state.btnOTP == 'active') {
			return (
				<View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start' }}>
					<TouchableOpacity onPress={() => { this.setState({ btnEmail: 'inactive' }) }} >
						<View style={styles.buttonOTP}>
							<Image
								style={{ width: 20, height: 22, marginTop: 1 }}
								source={require('../../../images/otpOn.png')}
							/>
							<Text style={styles.buttonTextOTP}>OTP</Text>
						</View>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => { this.setState({ btnOTP: 'inactive', btnEmail: 'active' }) }} >
						<View style={styles.buttonEmailOff}>
							<Text style={styles.buttonTextEmailOff}>Email</Text>
							<Icon type="FontAwesome" name="envelope" style={{ fontSize: 16, color: '#33B5E5', marginLeft: 5 }} />
						</View>
					</TouchableOpacity>
				</View>
			)
		} else {
			return (
				<View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start' }}>
					<TouchableOpacity onPress={() => { this.setState({ btnEmail: 'inactive', btnOTP: 'active' }) }} >
						<View style={styles.buttonOTPOff}>
							<Image
								style={{ width: 20, height: 22, marginTop: 1 }}
								source={require('../../../images/otpOff.png')}
							/>
							<Text style={styles.buttonTextOTPOff}>OTP</Text>
						</View>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => { this.setState({ btnOTP: "inactive" }) }} >
						<View style={styles.buttonEmail}>
							<Text style={styles.buttonTextEmail}>Email</Text>
							<Icon type="FontAwesome" name="envelope" style={{ fontSize: 16, color: '#FFFFFF', marginLeft: 5 }} />
						</View>
					</TouchableOpacity>
				</View>
			)
		}

	}

	_showHeader() {
		if (Platform.OS == 'ios') {
			return (
				<Header style={{ backgroundColor: '#0000FF' }}>
					<Left style={{ flex: 0.1 }}>
						<TouchableOpacity onPress={() => this.props.navigation.navigate('VerifierLoginScreen')}>
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
						<TouchableOpacity onPress={() => this.props.navigation.navigate('VerifierLoginScreen')}>
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

				<View style={styles.signUpViewContainer}>
					<ScrollView keyboardShouldPersistTaps="always">
						<Card style={styles.cardContainer}>

							<CardItem header style={styles.cardHeader}>
								<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'normal', fontSize: 18 }}>Sign up</Text>
							</CardItem>

							<Form>

								{!!this.state.nameError ? (
									<Form>
										<Item style={{ borderColor: 'red', borderWidth: 1 }}>
											<Input
												placeholder='Name'
												onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ nameError: null }) }}
												onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											/>
											<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
										</Item>
										<Text style={styles.errorMsg}>{this.state.nameError}</Text>
									</Form>
								) :
									<Item floatingLabel>
										<Label>Name</Label>
										<Input
											autoFocus={true}
											onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
											onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											onChangeText={(name) => this.setState({ name })}
										/>
									</Item>
								}

								{!!this.state.emailError ? (
									<Form>
										<Item style={{ borderColor: 'red', borderWidth: 1 }}>
											<Input
												placeholder='Email'
												onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ emailError: null }) }}
												onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											/>
											<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
										</Item>
										<Text style={styles.errorMsg}>{this.state.emailError}</Text>
									</Form>
								) :
									<Item floatingLabel>
										<Label>Email</Label>
										<Input
											keyboardType='email-address'
											onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
											onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											onChangeText={(email) => this.setState({ email })}
										/>
									</Item>
								}

								{!!this.state.phoneNumberError ? (
									<Form>
										<Item style={{ borderColor: 'red', borderWidth: 1 }}>
											<Input
												placeholder='+91 Phone Number'
												onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ phoneNumberError: null }) }}
												onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											/>
											<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
										</Item>
										<Text style={styles.errorMsg}>{this.state.phoneNumberError}</Text>
									</Form>
								) :
									<Item floatingLabel>
										<Label>+91 Phone number</Label>
										<Input
											keyboardType='number-pad'
											maxLength={10}
											onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
											onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											onChangeText={(phoneNumber) => this.setState({ phoneNumber })}
										/>
									</Item>
								}

								{!!this.state.userNameError ? (
									<Form>
										<Item style={{ borderColor: 'red', borderWidth: 1 }}>
											<Input
												placeholder='Choose user name'
												onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ userNameError: null }) }}
												onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											/>
											<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
										</Item>
										<Text style={styles.errorMsg}>{this.state.userNameError}</Text>
									</Form>
								) :
									<Item floatingLabel>
										<Label>Choose user name</Label>
										<Input
											onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
											onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											onChangeText={(userName) => this.setState({ userName })}
										/>
									</Item>
								}

								{!!this.state.passwordError ? (
									<Form>
										<Item style={{ borderColor: 'red', borderWidth: 1 }}>
											<Input
												placeholder='Password'
												onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ passwordError: null }) }}
												onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											/>
											<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
										</Item>
										<Text style={styles.errorMsg}>{this.state.passwordError}</Text>
									</Form>
								) :
									<Item floatingLabel>
										<Label>Password</Label>
										<Input
											secureTextEntry={true}
											onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
											onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											onChangeText={(password) => this.setState({ password })}
										/>
									</Item>
								}

								{!!this.state.confirmPasswordError ? (
									<Form>
										<Item style={{ borderColor: 'red', borderWidth: 1 }}>
											<Input
												placeholder='Confirm password'
												onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ confirmPasswordError: null }) }}
												onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											/>
											<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
										</Item>
										<Text style={styles.errorMsg}>{this.state.confirmPasswordError}</Text>
									</Form>
								) :
									<Item floatingLabel>
										<Label>Confirm password</Label>
										<Input
											secureTextEntry={true}
											onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
											onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											onChangeText={(confirmPassword) => this.setState({ confirmPassword })}
										/>
									</Item>
								}
								<View style={{ flex: 1, flexDirection: 'row', marginTop: 20 }}>
									<Text style={{ flex: 0.65, marginLeft: 15, marginTop: 10, color: '#9E9E9E' }}>Verification : </Text>

									{this._verficationButton()}
								</View>

								<TouchableOpacity onPress={() => this._onPressButton()}>
									<View style={styles.buttonSignUp}>
										<Text style={styles.buttonTextSignUp}>SIGN UP</Text>
									</View>
								</TouchableOpacity>


							</Form>
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
	signUpViewContainer: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'stretch',
		paddingTop: 5
	},
	cardContainer: {
		padding: 15,
		marginTop: 20,
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
	buttonSignUp: {
		marginTop: 10,
		alignItems: 'center',
		backgroundColor: '#0000FF',
		borderRadius: 5
	},
	buttonTextSignUp: {
		padding: 10,
		color: 'white',
	},
	buttonOTP: {
		flex: 1,
		flexDirection: 'row',
		padding: 8,
		alignItems: 'center',
		backgroundColor: '#33B5E5',
		borderBottomLeftRadius: 10,
		borderTopLeftRadius: 10,
		borderWidth: 0.7,
		borderColor: '#33B5E5',
	},
	buttonTextOTP: {

		paddingLeft: 5,
		color: 'white',
		fontSize: 12,
	},
	buttonEmail: {
		flex: 1,
		flexDirection: 'row',
		padding: 8,
		alignItems: 'center',
		backgroundColor: '#33B5E5',
		borderBottomRightRadius: 10,
		borderTopRightRadius: 10,
		borderWidth: 0.7,
		borderColor: '#33B5E5',
	},
	buttonTextEmail: {
		padding: 2,
		color: '#FFFFFF',
		fontSize: 12,
	},
	buttonEmailOff: {
		flex: 1,
		flexDirection: 'row',
		padding: 8,
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		borderBottomRightRadius: 10,
		borderTopRightRadius: 10,
		borderWidth: 0.7,
		borderColor: '#33B5E5',
	},
	buttonTextEmailOff: {
		padding: 2,
		color: '#33B5E5',
		fontSize: 12,

	},

	buttonOTPOff: {
		flex: 1,
		flexDirection: 'row',
		padding: 8,
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		borderBottomLeftRadius: 10,
		borderTopLeftRadius: 10,
		borderWidth: 0.7,
		borderColor: '#33B5E5',
	},
	buttonTextOTPOff: {
		fontSize: 12,
		padding: 2,
		color: '#33B5E5',
	},

	errorMsg: {
		marginLeft: 18,
		fontSize: 12,
		color: 'red'
	}
})