import React, { Component } from 'react';
import { Alert, BackHandler, Dimensions, Platform, Text, StyleSheet, View, Image, TouchableOpacity, StatusBar, Linking, PermissionsAndroid, } from 'react-native';
import { Header, Left, Body, Title, Icon, Tab, Tabs } from 'native-base';
// import BarcodeScanner, { FocusMode, CameraFillMode, FlashMode, BarcodeType, } from 'react-native-barcode-scanner-google';
import QRCodeScanner from 'react-native-qrcode-scanner';
import AndroidOpenSettings from 'react-native-android-open-settings';
import InstituteService from '../../../services/InstituteService/InstituteService';
import CustomHeader from '../../../Utility/CustomHeader';
import Loader from '../../../Utility/Loader';
import * as utilities from '../../../Utility/utilities';
import * as app from '../../../App';
import { Col, Row, Grid } from "react-native-easy-grid";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CertificateViewScreen from './CertificateViewScreen';
import ViewPrint from './ViewPrint';

export default class VerifierCertificateAndPrint extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userId: '',
            userName: '',
            flashEnabled: true,
            flash: false,
            loading: false,
            showCamera: true,
            loaderText: 'Scanning...',
            token: '',
            dataAboveCertificate: '',
            family_details:[]
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
        // this.didFocusSubscription.remove();
    }

    handleBackPress = () => {
        this.props.navigation.navigate('InstituteMainScreen');
        return true;
    }

    async _getAsyncData() {
        await AsyncStorage.multiGet(['USERDATA', 'CERTIFICATESCANNEDDATA'], (err, result) => {		// USERDATA is set on InstituteLogin screen

            // var lUserData = JSON.parse(result[0][1]);
            var lData = JSON.parse(result[1][1]);
            console.log("institute lData", lData);
            var lProps = this.props;
            ;
            // if (lProps.navigation.state.params) {
            // 	if (lData) {
            // 		this.setState({ serialNo: lProps.navigation.state.params.certificateData.serial_no, certificateURI: lProps.navigation.state.params.certificateData.certificate_filename, certificateStatus: lData.status });
            // 	}
            // }else {
            // 	if (lData) {
            // 		this.setState({ serialNo: lData.serial_no, certificateURI: lData.fileUrl,  });
            // 	}
            // }
            if (lData) {
                if (lData.scan_result == '1') {
                    this.setState({
                        serialNo: lData.serialNo,
                        certificateURI: lData.fileUrl,
                        certificateStatus: 'Active',
                        dataAboveCertificate: this.props.navigation.state.params.dataAboveCertificate,
                        family_details: this.props.navigation.state.params.family_details
                    });
                } else if (lData.scan_result == '0') {
                    this.setState({
                        serialNo: lData.serialNo,
                        certificateURI: lData.fileUrl,
                        certificateStatus: 'Inactive',
                        dataAboveCertificate: this.props.navigation.state.params.dataAboveCertificate,
                        family_details: this.props.navigation.state.params.family_details,
                    });
                }
            }
        });
    }

    _showHeader() {
        if (Platform.OS == 'ios') {
            return (
                <Header style={{ backgroundColor: '#D34A44' }} hasTabs>
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
                <Header style={{ backgroundColor: '#D34A44' }} hasTabs>
                    <Grid>
                        <Col size={2} style={{ justifyContent: 'center' }}>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('VerifierMainScreen')}>
                                <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
                            </TouchableOpacity>
                        </Col>
                        <Col size={10} style={{ justifyContent: 'center' }}>
                            <Title style={{ color: '#FFFFFF', fontSize: 16 }}>Scanned Details</Title>
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
        return (
            <View style={{ flex: 1 }}>
                { this._showHeader()}
                < StatusBar backgroundColor="#D34A44" barStyle="light-content" />
                <Loader loading={this.state.loading} text={this.state.loaderText} />
                <View style={{ flex: 1, }}>
                    <Tabs tabBarUnderlineStyle={{ backgroundColor: 'white' }}  >
                        <Tab heading="View Certificate" tabStyle={{ backgroundColor: '#D34A44' }} textStyle={{ color: '#fff' }}
                            activeTabStyle={{ backgroundColor: '#D34A44', }} activeTextStyle={{ color: 'white', fontWeight: 'bold' }}>

                            <CertificateViewScreen props={this.props}
                                navigation={this.props.navigation} />
                        </Tab>
                        <Tab heading="Family Details" tabStyle={{ backgroundColor: '#D34A44' }} textStyle={{ color: '#fff' }} activeTabStyle={{ backgroundColor: '#D34A44', borderBottomColor: 'red' }} activeTextStyle={{ color: 'white', fontWeight: 'bold' }}>
                            <ViewPrint props={this.props} navigation={this.props.navigation} />
                        </Tab>
                    </Tabs>

                </View>
            </View>

        );
    }
}