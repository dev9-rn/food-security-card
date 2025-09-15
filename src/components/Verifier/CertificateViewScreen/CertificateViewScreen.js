import React, { Component } from 'react';
import { StatusBar, BackHandler, Dimensions, Platform, StyleSheet, View, TouchableOpacity, ScrollView, Image, Modal, FlatList } from 'react-native';
import { Header, Left, Body, Right, Card, CardItem, Text, Title, Icon } from 'native-base';
import Pdf from 'react-native-pdf';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import Loader from '../../../Utility/Loader';
import * as app from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default class CertificateViewScreen extends Component {
	constructor(props) {
		super(props);
		console.log("CertificateViewScreen - Data:", this.props.navigation.state.params);
		this.state = {
			userId: '',
			serialNo: '',
			certificateURI: '',
			animating: false,
			loading: false,
			loaderText: 'Please wait downloading file...',
			showModal: false, // Modal visibility state
			dataForCertificate: this.props.navigation.state.params.certificateData,
			family_details: this.props.navigation.state.params.family_details,
			dataAboveCertificate: this.props.navigation.state.params.dataAboveCertificate.split('\n').slice(0, 3).join('\n'),

			// dataAboveCertificate: this.props.navigation.state.params.dataAboveCertificate.substring(this.props.navigation.state.params.dataAboveCertificate.lastIndexOf("\n") + 0, -1)
		};
		// console.log(this.props.navigation.state.params.dataAboveCertificate.substring(this.props.navigation.state.params.dataAboveCertificate.lastIndexOf("\n") + 0, -1));
	}

	toggleModal = () => {
        this.setState({ showModal: !this.state.showModal });
    };


	// componentWillMount() { this._getAsyncData(); }
	componentDidMount() { BackHandler.addEventListener('hardwareBackPress', this.handleBackPress); }
	componentWillUnmount() { BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress); }
	handleBackPress = () => { this.props.navigation.navigate('VerifierMainScreen'); return true; }
	closeActivityIndicator() { setTimeout(() => { this.setState({ animating: false, loading: false }); }); }

	_getAsyncData = async () => {
		await AsyncStorage.multiGet(['USERDATA', 'CERTIFICATESCANNEDDATA'], (err, result) => {		// USERDATA is set on SignUP screen
			var lUserData = JSON.parse(result[0][1]);
			var lData = JSON.parse(result[1][1]);
			console.log(result);
			var lProps = this.props;
			if (lProps.navigation.state.params) {
				if (lData) {
					this.setState({ serialNo: lProps.navigation.state.params.certificateData.serial_no, certificateURI: lProps.navigation.state.params.certificateData.certificate_filename, userId: lUserData.id });
				}
			} else {
				if (lData) {
					this.setState({ serialNo: lData.serial_no, certificateURI: lData.certificate_filename, userId: lUserData.id });
				}
			}
		});
	}
	getLocalPath(url) {
		const filename = url.split('/').pop();
		return `${RNFS.DocumentDirectoryPath}/${filename}`;
	}
	async downloadFile() {
		this.setState({ loading: true });
		const url = this.state.dataForCertificate.fileUrl;
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
					this.setState({ animating: false, loading: false });
				}, 2000);
				console.warn("Error in downloading file" + error);
			});
	}

	_showHeader() {
		if (Platform.OS == 'ios') {
			return (
				<Header style={{ backgroundColor: '#0000FF' }}>
					<Left>
						<TouchableOpacity onPress={() => this.props.navigation.navigate('VerifierMainScreen')}>
							<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
						</TouchableOpacity>
					</Left>
					<Body style={{ marginLeft: -50, width: '100%' }}>
						<Title style={{ color: '#FFFFFF' }}>Scanned details</Title>
					</Body>
					<Right>
						<TouchableOpacity onPress={() => this.props.navigation.navigate('VerifierScanScreen')}>
							<Title style={{ color: '#FFFFFF' }}>SCAN NEW</Title>
						</TouchableOpacity>
					</Right>
				</Header>
			)
		} else {
			return (
				<Header style={{ backgroundColor: '#0000FF' }}>
					<Left>
						<TouchableOpacity onPress={() => this.props.navigation.navigate('VerifierMainScreen')}>
							<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
						</TouchableOpacity>
					</Left>
					<Body>
						<Title style={{ color: '#FFFFFF', fontSize: 16 }}>Scanned details</Title>
					</Body>
					<Right>
						<TouchableOpacity onPress={() => this.props.navigation.navigate('VerifierScanScreen')}>
							<Title style={{ color: '#FFFFFF', fontSize: 16 }}>SCAN NEW</Title>
						</TouchableOpacity>
					</Right>
				</Header>
			)
		}
	}

	render() {
		const source = { uri: encodeURI(this.state.dataForCertificate.fileUrl), cache: true };

		console.log("family_details-------");
		console.log(this.state.family_details);
		return (
			<View style={styles.container}>
				{/* {this._showHeader()} */}
				<StatusBar barStyle="light-content" />
				<Loader loading={this.state.loading} text={this.state.loaderText} />
				<View style={styles.certificateViewContainer}>
					<Card style={styles.cardContainer}>
						<ScrollView keyboardShouldPersistTaps="always">
							<CardItem style={styles.cardHeader}>
								{this.state.dataAboveCertificate !== 'Decryption failed' ?
									<View style={{ flex: 1 }}>
										<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'bold', fontSize: 16 }}>Document ID : {this.state.dataForCertificate.serial_no}</Text>
										<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'bold', fontSize: 16 }}>Data :
										{
                                    this.state.dataAboveCertificate !== 'Decryption failed' ?
                                        <Text style={styles.textStatus}>{this.state.dataAboveCertificate}</Text>
                                        :
                                        <View></View>
                                }
										</Text>
										{/* <Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'bold', fontSize: 16 }}>{this.state.dataAboveCertificate.name ? this.state.dataAboveCertificate.name : ""}</Text>
										<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'bold', fontSize: 16 }}>{this.state.dataAboveCertificate.enrollmentNo ? this.state.dataAboveCertificate.enrollmentNo : ""}</Text>
										<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'bold', fontSize: 16 }}>{this.state.dataAboveCertificate.degree ? this.state.dataAboveCertificate.degree : ""}</Text>
										<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'bold', fontSize: 16 }}>{this.state.dataAboveCertificate.pointer ? this.state.dataAboveCertificate.pointer : ""}</Text> */}
									</View>
									:
									<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'bold', fontSize: 16 }}>Document ID : {this.state.dataForCertificate.serial_no}</Text>
								}
								
							</CardItem>

							{/* <TouchableOpacity 
                                        style={styles.viewDetailsButton}
                                        onPress={this.toggleModal}
                                    >
                                        <Text style={styles.viewDetailsText}> View Family Details</Text>
                                    </TouchableOpacity> */}
							
							<View style={{ paddingTop: 10, height: Dimensions.get('window').height * 0.7 }}>
								<View style={{ flex: 0.1, flexDirection: 'row' , padding:10 }}>
									<Text style={{ fontSize: 22, flex: 0.9 }}>Document</Text>
									<TouchableOpacity style={{ flex: 0.1 }} onPress={() => { this.downloadFile() }}>
										<Image
											style={{ width: 40, height: 40,  }}
											source={require('../../../images/forward_arrow.png')}
										/>
									</TouchableOpacity>
								</View>
								<Pdf
									source={source}
									trustAllCerts={false}
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
				{/* ✅ Family Details Modal */}
                <Modal
                    visible={this.state.showModal}
                    animationType="slide"
                    transparent={true}
                >
                    <View style={styles.modalBackground}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Family Details</Text>

                            <FlatList
                                data={this.state.family_details}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <View style={styles.familyItem}>
                                        <Text style={styles.familyText}> Name {item.name}</Text>
                                        <Text style={styles.familyText}> UID: {item.uid}</Text>
                                        <Text style={styles.familyText}> Relation: {item.relation || 'N/A'}</Text>
                                        <Text style={styles.familyText}> DOB: {item.dob}</Text>
                                    </View>
                                )}
                            />

                            {/* ❌ Close Button */}
                            <TouchableOpacity style={styles.closeButton} onPress={this.toggleModal}>
                                <Text style={styles.closeButtonText}>❌ Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
			</View>
		)
	}
}
const styles = StyleSheet.create({
	container: {
        flex: 1,
    },
    viewDetailsButton: {
        margin: 10,
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    viewDetailsText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    pdf: {
        flex: 1,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '90%',
        // alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    familyItem: {
        backgroundColor: '#f8f9fa',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        // width: '100%',
    },
    familyText: {
        fontSize: 14,
        color: '#212121',
    },
    closeButton: {
        marginTop: 10,
        backgroundColor: '#dc3545',
        padding: 10,
        borderRadius: 5,
		width:'100%',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
		textAlign:'center',
    },
});