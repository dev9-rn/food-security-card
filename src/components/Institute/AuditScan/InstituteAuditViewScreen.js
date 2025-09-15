import React, { Component } from 'react';
import { Alert, StatusBar, BackHandler, Dimensions, Platform, StyleSheet, View, TouchableOpacity, KeyboardAwareScrollView, FlatList } from 'react-native';
import { Container, Header, Left, Body, Right, Content, Card, CardItem, Text, Title, Item, Icon, Toast, List, ListItem } from 'native-base';
// import QRCodeScanner from 'react-native-qrcode-scanner';
import VerifierService from '../../../services/VerifierService/VerifierService';
import Pdf from 'react-native-pdf';
import moment from "moment";
import Loader from '../../../Utility/Loader';
import * as utilities from '../../../Utility/utilities';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default class InstituteAuditViewScreen extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			data: '',
			userId: '',
			serialNo: '',
			certificateURI: '',
			loading: false,
			loaderText: 'Loading...',
			barcode: '',
			userPrinted: '',
			printedDate: '',
			printedTime: '',
			printerUsed: '',
			printCount: '',
			status: '',

			printingDateTime: "",
			scan_result: ""
		};
	}

	componentWillMount() {
		this._getAsyncData();
	}

	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
	}

	handleBackPress = () => {
		this.props.navigation.navigate('InstituteMainScreen');
		return true;
	}

	closeActivityIndicator() {
		setTimeout(() => {
			this.setState({ animating: false, loading: false });
		});
	}

	async _getAsyncData() {
		await AsyncStorage.multiGet(['USERDATA', 'CERTIFICATESCANNEDDATA'], (err, result) => {		// USERDATA is set on InstituteLogin screen
			;
			var lUserData = JSON.parse(result[0][1]);

			var lData = JSON.parse(result[1][1]);
			console.log(lData);
			var lProps = this.props;

			if (lData) {
				this.setState({
					serialNo: lData.serial_no, userPrinted: lData.userPrinted,
					printingDateTime: lData.printingDateTime, printerUsed: lData.printerUsed,
					printCount: lData.printCount, barcode: lData.key, scan_result: lData.scan_result
				});
			} else {

			}


			// if (lProps.navigation.state.params) {
			// 	if (lData) {
			// 		this.setState({ serialNo: lProps.navigation.state.params.certificateData.serial_no, certificateURI: lProps.navigation.state.params.certificateData.certificate_filename, certificateStatus: lData.status });
			// 	}
			// }else {
			// 	if (lData) {
			// 		this.setState({ serialNo: lData.serial_no, certificateURI: lData.fileUrl,  });
			// 	}
			// }
			// if (lData) {
			// 	var dateTime = lData.printingDateTime.split(' ');
			// 	var lDate = dateTime[0];
			// 	var lTime = dateTime[1];
			// 	if (lData.status == '1') {
			// 		this.setState({ serialNo: lData.serialNo, userPrinted: lData.userPrinted, barcode: lData.key, certificateStatus: 'Active', printedDate: lDate, printedTime: lTime, printerUsed: lData.printerUsed, printCount: lData.printCount });
			// 		var items = [
			// 			{
			// 				'barcode': this.state.barcode,
			// 				'userPrinted': this.state.userPrinted,
			// 				'printedDate': this.state.printedDate,
			// 				'printedTime': this.state.printedTime,
			// 				'printerUsed': this.state.printerUsed,
			// 				'printCount': this.state.printCount,
			// 				'status': this.state.certificateStatus
			// 			},
			// 		];
			// 		this.setState({ data: items });
			// 	} else if (lData.status == '0') {
			// 		this.setState({ serialNo: lData.serialNo, userPrinted: lData.userPrinted, barcode: lData.key, certificateStatus: 'InActive', printedDate: lDate, printedTime: lTime, printerUsed: lData.printerUsed, printCount: lData.printCount });
			// 		var items = [
			// 			{
			// 				'barcode': this.state.barcode,
			// 				'userPrinted': this.state.userPrinted,
			// 				'printedDate': this.state.printedDate,
			// 				'printedTime': this.state.printedTime,
			// 				'printerUsed': this.state.printerUsed,
			// 				'printCount': this.state.printCount,
			// 				'status': this.state.certificateStatus
			// 			},
			// 		];
			// 		this.setState({ data: items });
			// 	}
			// }
		});
	}



	_showHeader() {
		if (Platform.OS == 'ios') {
			return (
				<Header style={{ backgroundColor: '#D34A44' }}>
					<Left>
						<TouchableOpacity onPress={() => this.props.navigation.navigate('InstituteMainScreen')}>
							<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
						</TouchableOpacity>
					</Left>
					<Body style={{ marginLeft: -50, width: '100%' }}>
						<Title style={{ color: '#FFFFFF' }}>Scanned details</Title>
					</Body>
					<Right>
						<TouchableOpacity onPress={() => this.props.navigation.navigate('InstituteAuditScanScreen')}>
							<Title style={{ color: '#FFFFFF' }}>SCAN NEW</Title>
						</TouchableOpacity>
					</Right>
				</Header>
			)
		} else {
			return (
				<Header style={{ backgroundColor: '#D34A44' }}>
					<Left>
						<TouchableOpacity onPress={() => this.props.navigation.navigate('InstituteMainScreen')}>
							<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
						</TouchableOpacity>
					</Left>
					<Body>
						<Title style={{ color: '#FFFFFF', fontSize: 16 }}>Scanned details</Title>
					</Body>
					<Right>
						<TouchableOpacity onPress={() => this.props.navigation.navigate('InstituteAuditScanScreen')}>
							<Title style={{ color: '#FFFFFF', fontSize: 16 }}>SCAN NEW</Title>
						</TouchableOpacity>
					</Right>
				</Header>
			)
		}
	}
	render() {
		return (
			<View style={styles.container}>
				{this._showHeader()}
				<StatusBar backgroundColor="#D34A44" barStyle="light-content" />
				<Loader loading={this.state.loading} text={this.state.loaderText} />
				<View style={styles.certificateViewContainer}>
					<Card style={styles.cardContainer}>
						<View>
							<Text style={{ fontSize: 18, fontWeight: "bold" }}>Barcode: <Text style={{ fontSize: 18, fontWeight: "100" }}>{this.state.barcode}</Text></Text>
							<View style={{ marginTop: 5 }} />
							<Text style={{ fontSize: 18, fontWeight: "bold" }}>User Printed: <Text style={{ fontSize: 18, fontWeight: "100" }}>{this.state.userPrinted}</Text></Text>
							<View style={{ marginTop: 5 }} />
							<Text style={{ fontSize: 18, fontWeight: "bold" }}>Printed Date: <Text style={{ fontSize: 18, fontWeight: "100" }}>{moment(this.state.printingDateTime).format("DD-MM-YYYY")}</Text></Text>
							<View style={{ marginTop: 5 }} />
							<Text style={{ fontSize: 18, fontWeight: "bold" }}>Printed Time: <Text style={{ fontSize: 18, fontWeight: "100" }}>{moment(this.state.printingDateTime).format("hh:mm:ss")}</Text></Text>
							<View style={{ marginTop: 5 }} />
							<Text style={{ fontSize: 18, fontWeight: "bold" }}>Printer used: <Text style={{ fontSize: 18, fontWeight: "100" }}>{this.state.printerUsed}</Text></Text>
							<View style={{ marginTop: 5 }} />
							<Text style={{ fontSize: 18, fontWeight: "bold" }}>Print count: <Text style={{ fontSize: 18, fontWeight: "100" }}>{this.state.printCount}</Text></Text>
						</View>
					</Card>
				</View>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	certificateViewContainer: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'stretch',
		paddingTop: Dimensions.get('window').height * 0.01
	},
	cardContainer: {
		flex: 1,
		padding: 15,
		marginTop: 10,
		marginLeft: 10,
		marginRight: 15
	},
	cardHeader: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'flex-start',
		borderBottomWidth: 1,
		borderBottomColor: '#E0E0E0'
	},
	pdf: {
		flex: 1,
	}
});