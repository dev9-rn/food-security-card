import React, { Component } from "react";
import {
  Alert,
  StatusBar,
  AsyncStorage,
  BackHandler,
  Dimensions,
  Platform,
  StyleSheet,
  View,
  TouchableOpacity,
  ToastAndroid,
  // WebView
} from "react-native";
import {
  Container,
  Header,
  Left,
  Body,
  Right,
  Content,
  Text,
  Title,
  Toast,
  Icon
} from "native-base";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import VerifierService from "../../../services/VerifierService/VerifierService";

import OfflineNotice from "../../../Utility/OfflineNotice";
import Loader from "../../../Utility/Loader";
import * as utilities from "../../../Utility/utilities";
import * as app from "../../../App";
import { scanSeQRData } from "../../../App";
import { WebView } from 'react-native-webview';

export default class PaymentWebView extends React.Component {
  constructor(props) {
    //  debugger;
    super(props);
    this.state = {
      url: "",
      userId: "",
      userName: "",
      flashEnabled: true,
      loading: false,
      loaderText: "Loading...",
      flash: false,
      showCamera: true,
      showCameraText: true,
      // data: scanSeQRData,
      deleteItem: false,
      e: null
    };
  }
  componentDidMount() {
    //console.log("key "+ this.props.navigation.getParams("key"));
    const { state } = this.props.navigation;
    var key = state.params.key;

    console.log("key " + key);
    var url = state.params.url;
    console.log(url);

    this.setState({ url: url });
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
  }
  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
  }

  handleBackPress = () => {
    // this.props.navigation.navigate("HomeScreen");
    ToastAndroid.show("Successful", ToastAndroid.SHORT);
    // data={this.state.data}
    // extraData={this.state}
    // key={(item, index) => item.index}
    // this.props.navigation.navigate('CertificateViewScreen', { certificateData: item });
    // this.props.navigation.navigate("VerifierScanScreen");
    // this._getAsyncData();
    return true;
  };

  closeActivityIndicator() {
    setTimeout(() => {
      this.setState({ animating: false, loading: false });
    });
  }
  show() {
    this.setState({ modalVisible: true });
  }

  hide() {
    this.setState({ modalVisible: false });
  }
  onNavigationChange(webViewState) {
    this.setState({ loading: false })
    // debugger;
    let hitUrl = webViewState.url;

    // ToastAndroid.show(webViewState.url, ToastAndroid.SHORT);
    if (
      webViewState.url.includes(
        "https://VU.seqronline.com/services/instaMojoSuccessWelcome.php"
      )
    ) {
      this.hide();
      // ToastAndroid.show("Successful", ToastAndroid.SHORT);
      // utilities.showToastMsg(webViewState.url);
      console.log(webViewState);
      //Show scanned certificate here
      //this._getAsyncData();
      //  console.log("e"+JSON.stringify(this.state.e));
      this._callForAPI(
        this.props.navigation.state.params.key,
        this.props.navigation.state.params.userName,
        this.props.navigation.state.params.userId
      );
      //this.props.navigation.navigate("VerifierScanScreen");
    }
    console.log("Logging url");
    // utilities.showToastMsg(webViewState.url);
    console.log("abc" + webViewState);
    console.log(hitUrl);
    // utilities.showToastMsg(hitUrl);
    if (
      hitUrl.includes(
        "https://VU.seqronline.com/WebApp/instaMojoSuccess.php?key="
      )
    ) {
      console.log(hitUrl);
      // we need the payment_req_id to get the status of paymnt
      let payment_final_id = hitUrl.split("payment_request_id=").pop();
      var response = {
        url: hitUrl,
        payment_final_id: payment_final_id
      };
      this.getPaymentDetails(payment_final_id);

      // OR comment upper statement and uncomment below statement to directly navigate to CertificateViewScreen
      // this.props.navigation.navigate('CertificateViewScreen');
    }
  }

  async _getAsyncData() {
    await AsyncStorage.getItem("USERDATA", (err, result) => {
      // USERDATA is set on SignUP screen
      var lData = JSON.parse(result);
      console.log("_getAsyncData" + result);
      if (lData) {
        this.setState({ userName: lData.username, userId: lData.id });
      }
    });
  }

  onSuccess(e) {
    this.setState({ showCamera: false });
    let lUserName = this.state.userName;
    let lUserId = this.state.userId;
    this._callForAPI(e.data, lUserName, lUserId);
  }

  async _callForAPI(e, lUserName, lUserId) {
    // this.setState({ loading: true })

    const formData = new FormData();
    formData.append("key", e);
    formData.append("device_type", Platform.OS);
    formData.append("scanned_by", lUserName);
    formData.append("user_id", lUserId);
    //this.setState({e: e ,userName : lUserName, userId : lUserId });
    //  formData.append("key", "E8BC8157D0DE71502DFC2034F62A6F98");
    //  formData.append("scanned_by", 'bhavin');
    //  formData.append("user_id", 404);

    var verifierApiObj = new VerifierService();
    console.log("form data " + formData);
    await verifierApiObj.scanByPublicUser(formData);
    var lResponseData = verifierApiObj.getRespData();
    this.setState({ loading: false })
    ToastAndroid.show("Status = " + lResponseData.status, ToastAndroid.SHORT);
    if (!lResponseData) {
      utilities.showToastMsg("Something went wrong. Please try again later");
      this.props.navigation.navigate("VerifierMainScreen");
    } else if (lResponseData.status == "1" && lResponseData.publish == "1") {
      if (!lResponseData.payment_status) {
        // try {
        //   await AsyncStorage.setItem(
        //     "CERTIFICATESCANNEDDATA",
        //     JSON.stringify(lResponseData)
        //   );
        //   var lData = {};
        //   lData = lResponseData;
        //   scanSeQRData.unshift(lData);
        // } catch (error) {
        //   console.warn(error);
        // }
        // setTimeout(() => {
        //   Alert.alert(
        //     "Scanning Successful",
        //     "You can not view certificate, Please make payment to view certificate",
        //     [
        //       {
        //         text: "OK",
        //         onPress: () => {
        //           this.props.navigation.navigate("PaymentDetailsScreen", {
        //             key: e.data
        //           });
        //         }
        //       },
        //       {
        //         text: "BACK",
        //         onPress: () => {
        //           this.props.navigation.navigate("VerifierMainScreen");
        //         }
        //       }
        //     ],
        //     { cancelable: false }
        //   );
        // }, 500);
        try {
          await AsyncStorage.setItem(
            "CERTIFICATESCANNEDDATA",
            JSON.stringify(lResponseData)
          );
          var lData = {};
          lData = lResponseData;
          console.log("myresponse:" + lResponseData);
          scanSeQRData.unshift(lData);
          this.props.navigation.navigate("CertificateViewScreen");
        } catch (error) {
          console.warn(error);
        }
      } else {
        utilities.showToastMsg(
          "QR code scanned successfully. You have made payment you can view certificate."
        );
        try {
          await AsyncStorage.setItem(
            "CERTIFICATESCANNEDDATA",
            JSON.stringify(lResponseData)
          );
          var lData = {};
          lData = lResponseData;
          scanSeQRData.unshift(lData);
          this.props.navigation.navigate("CertificateViewScreen");
        } catch (error) {
          console.warn(error);
        }
      }
    } else if (lResponseData.status == "1" && lResponseData.publish == "0") {
      await utilities.showToastMsg(
        "QR code part of the system. But certificate is inactive now"
      );
      this.props.navigation.navigate("VerifierMainScreen");
    } else if (lResponseData.status == "2") {
      setTimeout(() => {
        Alert.alert(
          "Scanning Error",
          "Please scan proper QR Code",
          [
            {
              text: "OK",
              onPress: () => {
                this.props.navigation.navigate("VerifierMainScreen");
              },
              style: "destructive"
            }
          ],
          { cancelable: false }
        );
      }, 500);
    } else {
      utilities.showToastMsg("Something went wrong. Please try again later");
    }
  }

  async getPaymentDetails(trans_id) {
    const self = this;
    var verifierApiObj = new VerifierService();

    // this.setState({ loading: true });

    await verifierApiObj.getpaymentStatus(trans_id);
    var lResponseData = verifierApiObj.getRespData();
    // debugger;
    this.closeActivityIndicator();
    // console.log(lResponseData);

    if (!lResponseData) {
      utilities.showToastMsg("Something went wrong. Please try again later");
    } else if (lResponseData.success == true) {
      if (lResponseData.payment_request.status == "Completed") {
        this.props.navigation.navigate("SuccessTransaction", {
          paymentResponse: lResponseData.payment_request
        });
      } else {
        this.props.navigation.navigate("FailedTransaction");
      }
    } else if (lResponseData.success == false) {
      utilities.showToastMsg("Transaction failed. Please try again later");
    } else {
      utilities.showToastMsg("Something went wrong. Please try again later");
    }
  }

  _showHeader() {
    if (Platform.OS == "ios") {
      return (
        <Header style={{ backgroundColor: "#0000FF" }}>
          <Left style={{ flex: 0.1 }}>
            <TouchableOpacity
              onPress={() =>
                this.props.navigation.navigate("VerifierMainScreen")
              }
            >
              <Icon
                type="FontAwesome"
                name="long-arrow-left"
                style={{
                  fontSize: 25,
                  color: "#FFFFFF",
                  paddingLeft: 10,
                  paddingRight: 10
                }}
              />
            </TouchableOpacity>
          </Left>
          <Body style={{ flex: 0.9 }}>
            <Title style={{ color: "#FFFFFF" }}>Make Payment</Title>
          </Body>
        </Header>
      );
    } else {
      return (
        <Header style={{ backgroundColor: "#0000FF" }}>
          <Left style={{ flex: 0.1 }}>
            <TouchableOpacity
              onPress={() =>
                this.props.navigation.navigate("VerifierMainScreen")
              }
            >
              <Icon
                type="FontAwesome"
                name="long-arrow-left"
                style={{ fontSize: 25, color: "#FFFFFF", paddingLeft: 10 }}
              />
            </TouchableOpacity>
          </Left>
          <Body style={{ flex: 0.9, alignItems: "center" }}>
            <Title style={{ color: "#FFFFFF", fontSize: 16, marginLeft: -10 }}>
              Make Payment
            </Title>
          </Body>
        </Header>
      );
    }
  }
  _onMessage = (message) => {
    console.log(message);
    alert(message)
  }
  render() {
    return (
      <View style={styles.container}>
        {this._showHeader()}
        <OfflineNotice />
        <StatusBar barStyle="light-content" />
        {/* <Modal
          animationType={"slide"}
          visible={this.state.modalVisible}
          onRequestClose={this.hide.bind(this)}
          transparent
        > */}
        <WebView
          source={{ uri: this.state.url }}
          // style={{ marginTop: 50 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          onNavigationStateChange={this.onNavigationChange.bind(this)}
          ref={(ref) => { this.webView = ref; }}
          onMessage={this._onMessage}
        />
        {/* </Modal> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});