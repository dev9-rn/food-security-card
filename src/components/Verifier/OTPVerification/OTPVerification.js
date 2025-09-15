import React from 'react';
import { StatusBar, ScrollView, BackHandler, Dimensions, StyleSheet, View, TextInput, Image, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { Header, Left, Body, Right, Content, Card, CardItem, Text, Title, Item, Label, Toast } from 'native-base';
import CodeInput from 'react-native-confirmation-code-input';
import LoginService from '../../../services/LoginService/LoginService';
import OfflineNotice from '../../../Utility/OfflineNotice';
import Loader from '../../../Utility/Loader';
import * as utilities from '../../../Utility/utilities';
import * as app from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
var interval;
export default class OTPVerification extends React.Component {
	constructor(props) {
		super(props);
		console.log(this.props);

		this.state = {
			OTP: '',
			time: '',
			otpCode: '',
			borderBottomColorPassword: '#757575',
			borderBottomColorUserName: '#757575',
			loading: false,
			loaderText: 'Verifying mobile number...',
			btnVerifyEnabled: false,
			btnResendOTPEnabled: false,
			phnNo: this.props.navigation.state.params,
			showHideValidate: false
		};
	}
	componentWillMount() { this._getAsyncData(); }
	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
		this._showNetErrMsg();
		this.countdown();
	}
	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
		clearInterval(interval);
	}
	handleBackPress = () => {
		BackHandler.exitApp();
		return true;
	}
	_showNetErrMsg() {
		if (!app.ISNETCONNECTED) {
			utilities.showToastMsg('No network available! Please check the connectivity settings and try again.');
		}
	}
	closeActivityIndicator() {
		setTimeout(() => {
			this.setState({ animating: false, loading: false });
		});
	}
	async _getAsyncData() {
		await AsyncStorage.getItem('OTPDATA', (err, result) => {		// OTPDATA is set on SignUP screen
			var lData = JSON.parse(result);
			console.log(result);
			if (lData) {
				this.setState({ UID: lData.UID, asyncOTP: lData.OTP });
			}
		});
	}
	countdown() {
		var time;
		if (!this.state.btnResendOTPEnabled) {

			var timer = '1:00';
			timer = timer.split(':');
			var minutes = timer[0];
			var seconds = timer[1];
			interval = setInterval(() => {

				seconds -= 1;
				if (minutes < 0) return;
				else if (seconds < 0 && minutes != 0) {
					minutes -= 1;
					seconds = 59;
				}
				else if (seconds < 10 && seconds.length != 2) {
					seconds = '0' + seconds;
				}
				time = minutes + ':' + seconds;
				this.setState({ time: time });

				if (minutes == 0 && seconds == 0) {
					this.setState({ btnResendOTPEnabled: true });
					clearInterval(interval);
				}
			}, 1000);
		}
	}
	_onFinishCheckingCode1(code) {
		this.setState({ btnVerifyEnabled: true, otpCode: code });
	}
	validateOTP() {
		let lOTP = this.state.otpCode;
		let res = '';
		if (this.state.asyncOTP == lOTP) {
			res = true;
		} else {
			res = false;
		}
		return res;
	}
	async callForAPI() {
		// let lUID = this.state.UID;
		let lAction = 'verifyOTP';
		let lOtp = this.state.otpCode;

		const formData = new FormData();
		// formData.append('id', lUID);
		formData.append('mobile_no', this.state.phnNo);
		formData.append('otp', lOtp);
		// formData.append('action', lAction);

		this.setState({ loading: true });
		// var loginApiObj = new LoginService();
		// await loginApiObj.otpVerify(formData);
		// var lResponseData = loginApiObj.getRespData();

		var lUrl = app.URL + 'mobile-no-verify';
		await fetch(lUrl, {
			method: 'POST',
			headers: app.HEADER,
			body: formData,
		})
			.then(res => {
				res.json().then(lResponseData => {
					this.closeActivityIndicator();
					this.setState({ showHideValidate: false })
					lResponseData.data.access_token = res.headers.map.accesstoken;
					console.log("lallu");
					console.log(lResponseData);

					if (!lResponseData) { utilities.showToastMsg('Something went wrong. Please try again later'); }
					else if (lResponseData.status == 403) { utilities.showToastMsg(lResponseData.message); }
					else if (lResponseData.status == 200) {
						AsyncStorage.setItem('USERDATA', JSON.stringify(lResponseData.data));
						utilities.showToastMsg('Login as verifier successful');
						this.props.navigation.navigate('VerifierMainScreen');
					} else { utilities.showToastMsg(lResponseData.message); }
				})
			})
			.catch((error) => {
				console.error(error);
			});
	}

	_onPressButton(action) {
		if (!app.ISNETCONNECTED) {
			utilities.showToastMsg('No network available! Please check the connectivity settings and try again.');
		} else {
			let lOTP = this.state.otpCode;
			var isValidOTP = '';
			if (lOTP == '') {
				utilities.showToastMsg('Enter OTP');
			}
			else if (lOTP) {
				if (this.state.showHideValidate) {
					this.callForAPI(action);
				} else {
					isValidOTP = this.validateOTP();
				}
				if (isValidOTP) {
					this.callForAPI(action);
				} else {
					utilities.showToastMsg('Verification failed! OTP mismatch');
				}
			} else {
				console.warn('Error');
			}
		}
	}

	async _onPressResendOTP() {
		if (!app.ISNETCONNECTED) {
			utilities.showToastMsg('No network available! Please check the connectivity settings and try again.');
		} else {
			let lUID = this.state.UID;
			let lAction = 'resendOTP';
			let lOtp = this.state.otpCode;

			const formData = new FormData();
			// formData.append('id', '404');
			formData.append('mobile_no', this.state.phnNo);

			var lUrl = app.URL + 'resend-otp';
			await fetch(lUrl, {
				method: 'POST',
				headers: app.HEADER,
				body: formData,
			})
				.then(res => {
					res.json().then(lResponseData => {
						this.closeActivityIndicator();
						// lResponseData.data.access_token = res.headers.map.accesstoken;
						console.log(lResponseData);

						if (!lResponseData) { utilities.showToastMsg('Something went wrong. Please try again later'); }
						else if (lResponseData.status == 200) {
							this.setState({ showHideValidate: true })
							utilities.showToastMsg(lResponseData.message);
						} else if (lResponseData.status == 403) {
							utilities.showToastMsg(lResponseData.message);
						} else {
							utilities.showToastMsg(lResponseData.message);
						}
					})
				})
				.catch((error) => {
					console.error(error);
				});


			// var loginApiObj = new LoginService();

			// this.setState({ loading: true });
			// await loginApiObj.resendOtpVerify(formData);
			// var lResponseData = loginApiObj.getRespData();
			// this.closeActivityIndicator();

			// if (!lResponseData) { utilities.showToastMsg('Something went wrong. Please try again later'); }
			// else if (lResponseData.status == 200) {
			// 	utilities.showToastMsg(lResponseData.message);
			// } else if (lResponseData.status == 403) {
			// 	utilities.showToastMsg(lResponseData.message);
			// } else {
			// 	utilities.showToastMsg(lResponseData.message);
			// }
		}
	}
	_showBtnVerify() {
		if (this.state.btnVerifyEnabled) {
			return (
				<TouchableOpacity onPress={() => this._onPressButton()}>
					<View style={styles.buttonVerifier}>
						<Text style={styles.buttonText}>VERIFY</Text>
					</View>
				</TouchableOpacity>
			);
		} else {
			return (
				<TouchableOpacity>
					<View style={styles.btnVerifyDisabled}>
						<Text style={styles.textVerifyDisabled}>VERIFY</Text>
					</View>
				</TouchableOpacity>
			);
		}

	}

	_showBtnResendOTP() {
		if (this.state.btnResendOTPEnabled) {
			return (
				<TouchableOpacity onPress={() => this._onPressResendOTP()}>
					<View style={styles.btnResendOTP}>
						<Text style={styles.buttonText}>RESEND OTP</Text>
					</View>
				</TouchableOpacity>
			)
		} else {
			return (
				<TouchableOpacity>
					<View style={styles.btnResendOTPDisabled}>
						<Text style={styles.textResendOTPDisabled}>
							RESEND OTP in
						</Text>
						<Text style={{ marginLeft: 2, color: 'white' }}>{this.state.time} </Text>
					</View>
				</TouchableOpacity>
			)
		}
	}

	render() {
		return (
			<View style={styles.container}>
				<Header style={{ backgroundColor: '#0000FF' }}>
					<Left />
					<Body style={{ flex: 1 }}>
						<Title style={{ color: '#FFFFFF', fontSize: 16, textAlign: "center" }}>{app.title}</Title>
					</Body>
					<Right />
				</Header>
				<OfflineNotice />
				<StatusBar
					barStyle="light-content"
				/>

				<Loader
					loading={this.state.loading}
					text={this.state.loaderText}
				/>

				<View style={styles.OTPViewContainer}>
					<ScrollView keyboardShouldPersistTaps="always">
						<Card style={styles.cardContainer}>

							<CardItem header style={styles.cardHeader}>
								<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'normal', fontSize: 18 }}>Verify mobile number</Text>
							</CardItem>

							<View style={{ paddingLeft: 0, paddingRight: 0, marginTop: 10 }}>
								<Text style={{ fontSize: 14, color: '#808080' }}>OTP has been sent to your mobile number, please enter it below.</Text>
								<View style={styles.inputContainer}>
									<CodeInput
										ref="codeInputRef2"
										keyboardType="number-pad"
										inactiveColor='white'
										autoFocus={false}
										ignoreCase={true}
										className='border-b-t'
										size={50}
										onFulfill={(code) => this._onFinishCheckingCode1(code)}
										containerStyle={{ marginTop: 10, marginBottom: 10, }}
										codeInputStyle={{ color: 'black', borderWidth: 1.5, borderBottomColor: 'black', borderTopColor: 'transparent', borderLeftColor: 'transparent', borderRightColor: 'transparent' }}
										codeLength={5}
									/>

								</View>
							</View>

							{this._showBtnVerify()}

							<View style={{ marginTop: 20 }}>
								<Text style={{ fontSize: 12 }}>Didn't received OTP?</Text>
							</View>

							{this._showBtnResendOTP()}

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
	OTPViewContainer: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'stretch',
		paddingTop: Dimensions.get('window').height * 0.05
	},
	cardContainer: {
		flex: 1,
		padding: 15,
		marginTop: 20,
		marginLeft: 30,
		marginRight: 30,
	},
	cardHeader: {
		borderBottomWidth: 1,
		borderBottomColor: '#E0E0E0'
	},
	inputContainer: {
		marginTop: 30,
		height: 60,
		flexDirection: 'row',
		justifyContent: 'space-between',
		// backgroundColor: 'skyblue',
	},
	inputs: {
		height: 45,
		width: 50,
		marginLeft: 5,
		borderBottomWidth: 1,

	},
	buttonVerifier: {
		marginTop: 10,
		alignItems: 'center',
		backgroundColor: '#0000FF',
		borderRadius: 5
	},
	btnVerifyDisabled: {
		marginTop: 10,
		alignItems: 'center',
		backgroundColor: '#D3D3D3',
		borderRadius: 5
	},
	btnResendOTP: {
		marginTop: 3,
		alignItems: 'center',
		backgroundColor: '#0000FF',
		borderRadius: 5
	},
	buttonText: {
		padding: 10,
		color: 'white',
	},
	textVerifyDisabled: {
		padding: 10,
		color: 'white',
	},
	btnResendOTPDisabled: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 3,
		alignItems: 'center',
		backgroundColor: '#D3D3D3',
		borderRadius: 5
	},
	textResendOTPDisabled: {
		padding: 10,
		color: 'white',
	}

})