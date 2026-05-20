import React, { Component } from 'react';
import { Alert, StatusBar, BackHandler, Dimensions, Platform, StyleSheet, View, Image, TouchableOpacity, Linking, KeyboardAwareScrollView, ScrollView } from 'react-native';
import { Container, Header, Left, Body, Right, Content, Card, CardItem, Text, Title, Item, Icon, Toast } from 'native-base';
import VerifierService from '../../../services/VerifierService/VerifierService';
import CustomHeader from '../../../Utility/CustomHeader';
import Pdf from 'react-native-pdf';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import OfflineNotice from '../../../Utility/OfflineNotice';
import Loader from '../../../Utility/Loader';
import * as utilities from '../../../Utility/utilities';
import * as app from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class InstituteCertificateViewScreen extends React.Component {
	constructor(props) {
		super(props);
		console.log(this.props.navigation.state.params);

		this.state = {
			certificateStatus: "",
			userId: '',
			serialNo: '',
			certificateURI: '',
			loading: false,
			loaderText: 'Please wait downloading file......',
			pdfNotFound: false,
			dataForCertificate: this.props.navigation.state.params.certificateData,
			// dataAboveCertificate: this.props.navigation.state.params.dataAboveCertificate
			dataAboveCertificate: this.props.navigation.state.params.dataAboveCertificate.substring(this.props.navigation.state.params.dataAboveCertificate.lastIndexOf("\n") + 0, -1)
		};
		console.log(this.state.dataForCertificate);

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
			this.setState({ loading: false });
		});
	}

	async _getAsyncData() {
		await AsyncStorage.multiGet(['USERDATA', 'CERTIFICATESCANNEDDATA'], (err, result) => {		// USERDATA is set on InstituteLogin screen

			// var lUserData = JSON.parse(result[0][1]);
			var lData = JSON.parse(result[1][1]);
			console.log("=-=-=-==-=-=-=");

			console.log(lData);

			if (lData) {
				this.setState({ serialNo: lData.serialNo, certificateURI: lData.fileUrl, 
					certificateStatus: lData.scan_result == "1" ? 'Active' : 'In-Active' });
			}
		});
	}

	getLocalPath(url) {
		const filename = url.split('/').pop();
		return `${RNFS.DocumentDirectoryPath}/${filename}`;
	}

	downloadFile() {
		this.setState({ loading: true });
		const url = this.state.certificateURI;
		const localFile = this.getLocalPath(url);

		const options = {
			fromUrl: url,
			toFile: localFile
		};

		RNFS.downloadFile(options).promise
			.then(async () => {
				this.setState({ loading: false });
				setTimeout(() => { FileViewer.open(localFile) }, 500);
			})
			.catch(error => {
				setTimeout(() => {
					this.setState({ loading: false });
				}, 2000);
				console.warn("Error in downloading file" + error);
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
						<TouchableOpacity onPress={() => this.props.navigation.navigate('InstituteScanScreen')}>
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
						<TouchableOpacity onPress={() => this.props.navigation.navigate('InstituteScanScreen')}>
							<Title style={{ color: '#FFFFFF', fontSize: 16 }}>SCAN NEW</Title>
						</TouchableOpacity>
					</Right>
				</Header>
			)
		}
	}

	render() {
		// const source = { uri: this.state.certificateURI, cache: true };
		const source = { uri: encodeURI(this.state.dataForCertificate.fileUrl), cache: false };
		return (
			<View style={styles.container}>
				{Platform.OS == 'ios' ?
					<CustomHeader
						prop={this.props}
						bodyTitle={'Scanned details'}
						rightContent={<TouchableOpacity onPress={() => this.props.navigation.navigate('InstituteScanScreen')}>
							<Title style={{ color: '#FFFFFF', fontSize: 16 }}>SCAN NEW</Title>
						</TouchableOpacity>}
						navigateTo='InstituteMainScreen'
						headerStyle={{ backgroundColor: '#D34A44' }}
						bodyStyle={{ marginLeft: -50, width: '100%' }}
					/>
					:
					<CustomHeader
						prop={this.props}
						bodyTitle={'Scanned details'}
						rightContent={<TouchableOpacity onPress={() => this.props.navigation.navigate('InstituteScanScreen')}>
							<Title style={{ color: '#FFFFFF', fontSize: 16 }}>SCAN NEW</Title>
						</TouchableOpacity>}
						navigateTo='InstituteMainScreen'
						headerStyle={{ backgroundColor: '#D34A44' }}

					/>
				}

				<StatusBar
					backgroundColor="#D34A44"
					barStyle="light-content"
				/>

				<Loader
					loading={this.state.loading}
					text={this.state.loaderText}
				/>

				<View style={styles.certificateViewContainer}>
					<Card style={styles.cardContainer}>
						<ScrollView keyboardShouldPersistTaps="always">
							<CardItem header style={styles.cardHeader}>
								{/* <Text style={styles.textSrNo}>Sr.no : {this.state.serialNo}</Text> */}
								{this.state.dataAboveCertificate ?
									<View style={{ flex: 1 }}>
										<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'bold', fontSize: 16 }}>{this.state.dataAboveCertificate.trim()}</Text>
										<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'bold', fontSize: 16 }}>{this.state.certificateStatus}</Text>
										{/* <Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'bold', fontSize: 16 }}>{this.state.dataAboveCertificate.name ? this.state.dataAboveCertificate.name : ""}</Text>
										<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'bold', fontSize: 16 }}>{this.state.dataAboveCertificate.enrollmentNo ? this.state.dataAboveCertificate.enrollmentNo : ""}</Text>
										<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'bold', fontSize: 16 }}>{this.state.dataAboveCertificate.degree ? this.state.dataAboveCertificate.degree : ""}</Text>
										<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'bold', fontSize: 16 }}>{this.state.dataAboveCertificate.pointer ? this.state.dataAboveCertificate.pointer : ""}</Text> */}
									</View>
									:
									<View>
										<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'bold', fontSize: 16 }}>Sr.no : {this.state.dataForCertificate.serialNo}</Text>
										<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'bold', fontSize: 16 }}>Status : {this.state.certificateStatus}</Text>
									</View>
								}
								{/* <Text style={styles.textSrNo}>Sr.no : {this.state.dataForCertificate.serialNo}</Text> */}
							</CardItem>
							<View style={{ paddingTop: 10, height: Dimensions.get('window').height * 0.7 }}>
								<View style={{ flex: 0.1, flexDirection: 'row' }}>
									<Text style={{ fontSize: 22, flex: 0.9 }}>Certificate</Text>
									{/* <TouchableOpacity style={{ flex: 0.1 }} onPress={() => { this.downloadFile() }}>
										<Image
											style={{ width: 30, height: 30 }}
											source={require('../../../images/forward_arrow.png')}
										/>
									</TouchableOpacity> */}
								</View>
								{this.state.pdfNotFound ? <Text style={{ flex: 1, justifyContent: "center", textAlign: "center", textAlignVertical: "center", fontSize: 22, color: "red", backgroundColor: "#f2f2f2" }}>PDF not found</Text> :
									<Pdf
										source={source}
										onLoadComplete={(numberOfPages, filePath) => {
											console.log(`number of pages: ${numberOfPages}`);
										}}
										onPageChanged={(page, numberOfPages) => {
											console.log(`current page: ${page}`);
										}}
										onError={(error) => {
											this.setState({ pdfNotFound: true })
											console.log(error);
										}}
										style={styles.pdf} />}
							</View>
						</ScrollView>
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
		paddingTop: 0,
		marginTop: 10,
		marginLeft: 15,
		marginRight: 15
	},
	cardHeader: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'flex-start',
		borderBottomWidth: 1,
		borderBottomColor: '#E0E0E0',
	},
	textStatus: {
		marginLeft: -16,
		color: '#212121',
		fontWeight: 'normal',
		fontSize: 16
	},
	textSrNo: {
		marginLeft: -12,
		color: '#212121',
		fontWeight: 'normal',
		fontSize: 16
	},
	pdf: {
		flex: 1,
		// width:Dimensions.get('window').width,
	}
});

