import React, { Component } from 'react';
import { Alert, BackHandler, Dimensions, Platform, StyleSheet, View, TextInput, Image, TouchableOpacity, KeyboardAvoidingView, StatusBar } from 'react-native';
import { Container, Header, Left, Body, Right, Content, Card, CardItem, Text, Title, Item, Icon, Toast, Tab, Tabs } from 'native-base';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import Loader from '../../../Utility/Loader';
import * as utilities from '../../../Utility/utilities';
import Tab1 from './Tab1';
import Tab2 from './Tab2';
import { Col, Grid } from "react-native-easy-grid";
import * as app from '../../../App';
import { URL, HEADER, APIKEY } from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class VerifierHistoryScreen extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			loaderText: 'Please wait while loading...',
			historyCleared: false,
			userId: '',
			token: '',
			username: '',
			scanSeQRData: [],
			scanQRData: [],
		};
	}

	async _getAsyncData() {
		await AsyncStorage.getItem("USERDATA", (err, result) => {
			// USERDATA is set on SignUP screen
			var lData = JSON.parse(result);
			console.log("calling async data", result);
			if (lData) {
				this.setState({ userName: lData.username, userId: lData.id, token: lData.access_token });
			}
		});
		this._callForAPI();

	}

	componentDidMount() {
		BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
		this._getAsyncData();
		// this._callForAPI();
	}

	componentWillUnmount() { BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress); }
	handleBackPress = () => { this.props.navigation.navigate('VerifierMainScreen'); return true; }

	async _callForAPI() {
		this.setState({ loading: true });
		const formData = new FormData();
		formData.append('device_type', Platform.OS);
		formData.append('user_id', this.state.userId);
		// console.log(formData);

		await fetch(`${URL}scan-history`, {
			method: 'POST',
			headers: {
				'Accept': 'application\/json',
				'Content-Type': 'multipart\/form-data',
				'apikey': HEADER.apikey,
				'accesstoken': this.state.token
			},
			body: formData,
		}).then(res => res.json())
			.then(response => {
				console.log(response);
				// this.setState({ loading: false })
				if (response.status == 200) {

					console.log("My response", response.data[0].scan_result);
					for (var i = 0; i < response.data.length; i++) {
						if (response.data[i].scan_result == "1") {

							if (response.data[i].document_id !== null)
								this.state.scanSeQRData.push(response.data[i]);
							//scanSeQRData.push(response.data[i].document_id);
						}
						else {
							if (response.data[i].document_id !== null)
								this.state.scanQRData.push(response.data[i]);
							//	scanQRData.push(response.data[i].data)
						}
					}
					console.log("seqr data", this.state.scanSeQRData.length);
					console.log("qr data", this.state.scanQRData.length);
					// AsyncStorage.setItem('SCANDATA', JSON.stringify(this.state.scanSeQRData));
					this.setState({ loading: false })
				} else if (response.status == 409) { utilities.showToastMsg(response.message); }
				else if (response.status == 422) { utilities.showToastMsg(response.message); }
				else if (response.status == 400) { utilities.showToastMsg(response.message); }
				else if (response.status == 403) { utilities.showToastMsg(response.message); this.props.navigation.navigate('VerifierLoginScreen') }
				else if (response.status == 405) { utilities.showToastMsg(response.message); }
				else if (response.status == 500) {
					utilities.showToastMsg(response.message);
					//this.setState({ showCamera: true, }), this.state.qrCodes.pop()
				}
			})
			.catch(error => {
				this.setState({ loading: false })
				console.log("e:", error);
			});
	}


	_showHeader() {
		if (Platform.OS == 'ios') {
			return (
				<Header style={{ backgroundColor: '#0000FF' }} hasTabs>
					<Grid>
						<Col size={2} style={{ justifyContent: 'center' }}>
							<TouchableOpacity onPress={() => this.props.navigation.navigate('VerifierMainScreen')}>
								<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
							</TouchableOpacity>
						</Col>
						<Col size={10} style={{ justifyContent: 'center' }}>
							<Title style={{ color: '#FFFFFF', fontSize: 16 }}>Scan history</Title>
						</Col>
						<Col size={1} style={{ justifyContent: 'center' }}>
							{/* <Menu>
								<MenuTrigger>
									<Image
										style={{ width: 20, height: 20, paddingRight: 15 }}
										source={require('../../../images/three_dots.png')}
									/>
								</MenuTrigger>
								<MenuOptions>
									<MenuOption onSelect={() => this._clearHistory()} style={{ padding: 15 }}>
										<Text style={{ color: 'black' }}>Clear history</Text>
									</MenuOption>
								</MenuOptions>
							</Menu> */}
						</Col>
					</Grid>
				</Header>
			)
		} else {
			return (
				<Header style={{ backgroundColor: '#0000FF' }} hasTabs>
					<Grid>
						<Col size={2} style={{ justifyContent: 'center' }}>
							<TouchableOpacity onPress={() => this.props.navigation.navigate('VerifierMainScreen')}>
								<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
							</TouchableOpacity>
						</Col>
						<Col size={10} style={{ justifyContent: 'center' }}>
							<Title style={{ color: '#FFFFFF', fontSize: 16 }}>Scan history</Title>
						</Col>
						<Col size={1} style={{ justifyContent: 'center' }}>
							{/* <Menu>
								<MenuTrigger>
									<Image
										style={{ width: 20, height: 20, paddingRight: 15 }}
										source={require('../../../images/three_dots.png')}
									/>
								</MenuTrigger>
								<MenuOptions>
									<MenuOption onSelect={() => this._clearHistory()} style={{ padding: 15 }}>
										<Text style={{ color: 'black' }}>Clear history</Text>
									</MenuOption>
								</MenuOptions>
							</Menu> */}
						</Col>
					</Grid>
				</Header>
			)
		}
	}

	render() {
		console.log("eeee", this.state.scanSeQRData);
		return (
			<View style={styles.container}>
				{this._showHeader()}

				<StatusBar

					barStyle="light-content"
				/>

				<Loader
					loading={this.state.loading}
					text={this.state.loaderText}
				/>
				<Tabs>
					<Tab heading="SeQR" tabStyle={{ backgroundColor: 'blue' }} textStyle={{ color: '#fff' }} activeTabStyle={{ backgroundColor: 'blue' }} activeTextStyle={{ color: '#fff', fontWeight: 'normal' }}>

						<Tab1 props={this.props} navigation={this.props.navigation, { 'scanSeQRData': this.state.scanSeQRData }} />
					</Tab>
					<Tab heading="QR" tabStyle={{ backgroundColor: 'blue' }} textStyle={{ color: '#fff' }} activeTabStyle={{ backgroundColor: 'blue' }} activeTextStyle={{ color: '#fff', fontWeight: 'normal' }}>
						<Tab2 props={this.props} navigation={this.props.navigation, { 'scanQRData': this.state.scanQRData }} />
					</Tab>
				</Tabs>

			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
})