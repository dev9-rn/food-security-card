import React, { Component } from 'react';
import { Alert, StatusBar, BackHandler, Dimensions, Platform, StyleSheet, View, Image, TouchableOpacity, Linking, KeyboardAwareScrollView, ScrollView } from 'react-native';
import { Container, Header, Left, Body, Right, Content, Card, CardItem, Text, Title, Item, Icon, Toast } from 'native-base';
import QRCodeScanner from 'react-native-qrcode-scanner';

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
export default class DocumentViewScreen extends React.Component {

	constructor(props) {
		debugger;
		super(props);
		this.state = {
			isConnected: true,
			userId: '',
			serialNo: '',
			certificateURI: '', //this.props.navigation.state.params.docURL,
			loading: false,
			loaderText: 'Please wait downloading file......',
		};
	}

	componentWillMount() {
		this.setState({ isConnected: app.ISNETCONNECTED });
		this._getAsyncData();
	}

	componentDidMount() {
		this.setState({ serialNo: this.props.navigation.state.params.docNo, certificateURI: this.props.navigation.state.params.docURL });
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
		this._showNetErrMsg();
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
	}

	handleBackPress = () => {
		this.props.navigation.navigate('DocumentListScreen');
		return true;
	}

	handleConnectivityChange = isConnected => {
		if (isConnected) {
			this.setState({ isConnected });
		} else {
			this.setState({ isConnected });
			// this._showNetErrMsg();
			// utilities.showToastMsg('No network available! Please check the connectivity settings and try again.');
		}
	};

	closeActivityIndicator() {
		setTimeout(() => {
			this.setState({ loading: false });
		});
	}

	_showNetErrMsg() {
		if (!this.state.isConnected || !app.ISNETCONNECTED) {
			Alert.alert(
				'No network available',
				'No internet connection',
				[

					{ text: 'BACK', onPress: () => { this.props.navigation.navigate('DocumentListScreen') } },
					{ text: 'CONTINUE', onPress: () => { this.setState({ isConnected: false }) } },
				],
				{ cancelable: false }
			)
		}
	}

	async _getAsyncData() {
		await AsyncStorage.multiGet(['USERDATA'], (err, result) => {		// USERDATA is set on InstituteLogin screen
			debugger;
			var lUserData = JSON.parse(result[0][1]);
			// var lData = JSON.parse(result[1][1]);
			console.log(result);
			var lProps = this.props;

			// if (lData) {
			// 	if(lData.status == '1')
			// 	{
			// 		this.setState({ serialNo: lData.serialNo, certificateURI: lData.fileUrl, certificateStatus: 'Active' });
			// 	}else if (lData.status == '0') {
			// 		this.setState({ serialNo: lData.serialNo, certificateURI: lData.fileUrl, certificateStatus: 'Inactive' });
			// 	}
			// 		}
		});
	}

	getLocalPath(url) {
		const filename = url.split('/').pop();
		return `${RNFS.DocumentDirectoryPath}/${filename}`;
	}

	downloadFile() {
		if (!this.state.isConnected || !app.ISNETCONNECTED) {
			utilities.showToastMsg('No network available! Please check the connectivity settings and try again.');
		} else {
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
	}

	render() {
		const source = { uri: this.state.certificateURI, cache: true };
		return (
			<View style={styles.container}>
				{Platform.OS == 'ios' ?
					// <CustomHeader 
					// 	prop={this.props} 
					// 	bodyTitle={'Scanned details'} 
					// 	navigateTo='DocumentListScreen' 
					// 	headerStyle={{backgroundColor: '#68228B'}}
					// />
					<Header style={{ backgroundColor: "#68228B" }} hasTabs>
						<View style={{ justifyContent: 'center' }}>
							<TouchableOpacity onPress={() => this.props.navigation.navigate("DocumentListScreen")} >
								<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: "#FFFFFF", paddingLeft: 10, paddingRight: 10 }} />
							</TouchableOpacity>
						</View>
						<View style={{ justifyContent: 'center', flex: 1, marginRight: 40 }}>
							<Title style={{ color: "#FFFFFF", fontSize: 16 }}> Scanned details </Title>
						</View>
					</Header>
					:
					<Header style={{ backgroundColor: "#68228B" }} hasTabs>
						<View style={{ justifyContent: 'center' }}>
							<TouchableOpacity onPress={() => this.props.navigation.navigate("DocumentListScreen")} >
								<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: "#FFFFFF", paddingLeft: 10, paddingRight: 10 }} />
							</TouchableOpacity>
						</View>
						<View style={{ justifyContent: 'center', flex: 1, marginRight: 40 }}>
							<Title style={{ color: "#FFFFFF", fontSize: 16 }}> Scanned details </Title>
						</View>
					</Header>
				}

				<StatusBar
					backgroundColor="#68228B"
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

								<Text style={styles.textSrNo}>Document no : {this.state.serialNo}</Text>
							</CardItem>
							<View style={{ paddingTop: 10, height: Dimensions.get('window').height * 0.7 }}>
								<View style={{ flex: 0.1, flexDirection: 'row' }}>
									<Text style={{ fontSize: 22, flex: 0.9 }}>Certificate</Text>
									<TouchableOpacity style={{ flex: 0.1 }} onPress={() => { this.downloadFile() }}>
										<Image
											style={{ width: 30, height: 30 }}
											source={require('../../../images/forward_arrow.png')}
										/>
									</TouchableOpacity>
								</View>

								<Pdf
									source={source}
									onLoadComplete={(numberOfPages, filePath) => {
										console.log(`number of pages: ${numberOfPages}`);
									}}
									onPageChanged={(page, numberOfPages) => {
										console.log(`current page: ${page}`);
									}}
									onError={(error) => {
										console.log(error);
									}}
									style={styles.pdf} />

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

