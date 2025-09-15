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
  TextInput,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Picker
} from "react-native";
import {
  Container,
  Header,
  Left,
  Body,
  Right,
  Content,
  Card,
  CardItem,
  Text,
  Title,
  Item,
  Label,
  Toast,
  InputGroup,
  Input,
  Icon,
  Form
} from "native-base";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import VerifierService from "../../../services/VerifierService/VerifierService";


import OfflineNotice from "../../../Utility/OfflineNotice";
import Loader from "../../../Utility/Loader";
import * as utilities from "../../../Utility/utilities";
import * as app from "../../../App";

export default class PaymentDetailsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.key = this.props.navigation.state.params.key;
    this.state = {
      name: "",
      email: "",
      amount: "",
      borderBottomColorPassword: "#757575",
      borderBottomColorUserName: "#757575",
      loading: false,
      loaderText: "Please wait...",
      nameError: null,
      emailError: null,
      amountError: null,
      purposeError: null
    };
  }


  componentDidMount() {
    this.getAsyncUserData();
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
    // this._showNetErrMsg();
    // this.getAsyncUserData();
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
  }

  handleBackPress = () => {
    this.props.navigation.navigate("HomeScreen");
    return true;
  };

  _openSettings() {
    if (Platform.OS == "ios") {
      Linking.canOpenURL("app-settings:")
        .then(supported => {
          if (!supported) {
            console.log("Can't handle settings url");
          } else {
            return Linking.openURL("app-settings:");
          }
        })
        .catch(err => console.error("An error occurred", err));
    } else {
      AndroidOpenSettings.generalSettings();
    }
  }

 

  closeActivityIndicator() {
    setTimeout(() => {
      this.setState({ loading: false });
    });
  }

  async getAsyncUserData() {
    await AsyncStorage.multiGet(["USERDATA"], (err, result) => {
      var lData = JSON.parse(result[0][1]);
      if (lData) {
        this.userId = lData.id;
        this.callForAPI();

      }
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

  _validateMobileNumber() {
    let lAmount = this.state.amount;
    let res = "";
    res = utilities.checkMobileNumber(lAmount);
    if (!res || lAmount.trim().length < 10) {
      this.setState({
        amountError: "This phone number appears to be invalid."
      });
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

  async callForAPI() {
    let lName = this.state.name.trim();
    let lEmail = this.state.email.trim();
    let lAmount = this.state.amount;
    let lPurpose = this.state.purpose;

    const formData = new FormData();
    formData.append("user_id", this.userId);
    formData.append("amount", lAmount);
    formData.append("emailId", lEmail);
    formData.append("student_key", this.key);

    var verifierApiObj = new VerifierService();

    this.setState({ loading: true });
    await verifierApiObj.makePayment(formData);
    var lResponseData = verifierApiObj.getRespData();
    console.log(lResponseData);

    if (!lResponseData) {
      this.closeActivityIndicator();
      utilities.showToastMsg("Something went wrong. Please try again later");
    } else if (lResponseData.status == false) {
      this.closeActivityIndicator();
      this.setState({ amountError: lResponseData.message });
      utilities.showToastMsg(lResponseData.message);
    } else if (lResponseData.status == "true") {
      this.closeActivityIndicator();
      // utilities.showToastMsg(lResponseData.message);
      this.props.navigation.navigate("PaymentWebView", {
        url: lResponseData.longurl,
        key: this.props.navigation.state.params.key,
        userName : this.props.navigation.state.params.userName,
        userId : this.props.navigation.state.params.userId
      });
    } else {
      this.closeActivityIndicator();
      utilities.showToastMsg("Something went wrong. Please try again later");
    }
  }

  _onPressButton() {
    if (!app.ISNETCONNECTED) {
      utilities.showToastMsg(
        "No network available! Please check the connectivity settings and try again."
      );
    } else {
      let lName = this.state.name;
      let lEmail = this.state.email;
      let lAmount = this.state.amount;

      var isValidName = "";

      if (lName === "") {
        this.setState({ nameError: "Name is required." });
      } else {
        this.setState({ nameError: null });
      }

      if (lAmount === "") {
        this.setState({ amountError: "Amount required." });
      } else {
        this.setState({ amountError: null });
      }

      if (lAmount != "") {
        // isValidName = this._validateName();

        // if ( isValidName ) {
        this.callForAPI();
        // }
      } else {
        // if (lAmount != '') {
        // 	lAmount = '';
        // 	isValidMobileNumber = this._validateMobileNumber();
        // }
      }
    }
  }

  _showHeader() {
    if (Platform.OS == "ios") {
      return (
        <Header style={{ backgroundColor: "#0000FF" }}>
          <Left style={{ flex: 0.1 }}>
            <TouchableOpacity
              onPress={() =>
                this.props.navigation.navigate("VerifierScanScreen")
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
            <Title style={{ color: "#FFFFFF" }}>Payment Details</Title>
          </Body>
        </Header>
      );
    } else {
      return (
        <Header style={{ backgroundColor: "#0000FF" }}>
          <Left style={{ flex: 0.1 }}>
            <TouchableOpacity
              onPress={() =>
                this.props.navigation.navigate("VerifierScanScreen")
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
              Payment Details
            </Title>
          </Body>
        </Header>
      );
    }
  }

  render() {
    return (
      <View style={styles.container}>
        {this._showHeader()}
        <OfflineNotice />
        <StatusBar barStyle="light-content" />

        <Loader loading={this.state.loading} text={this.state.loaderText} />

        <View style={styles.detailsContainer}>
          <Card style={styles.cardContainer}>
            <Form>
              {!!this.state.nameError ? (
                <Form>
                  <Item style={{ borderColor: "red", borderWidth: 1 }}>
                    <Input
                      placeholder="Name"
                      onFocus={() => {
                        this.setState({ borderBottomColorUserName: "#50CAD0" });
                        this.setState({ nameError: null });
                      }}
                      onBlur={() => {
                        this.setState({ borderBottomColorUserName: "#757575" });
                      }}
                    />
                    <Icon
                      name="exclamation-circle"
                      type="FontAwesome"
                      style={{ fontSize: 20, color: "red" }}
                    />
                  </Item>
                  <Text style={styles.errorMsg}>{this.state.nameError}</Text>
                </Form>
              ) : (
                <Item floatingLabel>
                  <Label>Name</Label>
                  <Input
                    value={this.state.name}
                    style={{ marginTop: 3 }}
                    autoFocus={true}
                    onFocus={() => {
                      this.setState({ borderBottomColorUserName: "#50CAD0" });
                    }}
                    onBlur={() => {
                      this.setState({ borderBottomColorUserName: "#757575" });
                    }}
                    onChangeText={name => this.setState({ name })}
                  />
                </Item>
              )}

              {!!this.state.amountError ? (
                <Form>
                  <Item style={{ borderColor: "red", borderWidth: 1 }}>
                    <Input
                      placeholder="Amount"
                      onFocus={() => {
                        this.setState({ borderBottomColorUserName: "#50CAD0" });
                        this.setState({ amountError: null });
                      }}
                      onBlur={() => {
                        this.setState({ borderBottomColorUserName: "#757575" });
                      }}
                    />
                    <Icon
                      name="exclamation-circle"
                      type="FontAwesome"
                      style={{ fontSize: 20, color: "red" }}
                    />
                  </Item>
                  <Text style={styles.errorMsg}>{this.state.amountError}</Text>
                </Form>
              ) : (
                <Item floatingLabel>
                  <Label>Amount</Label>
                  <Input
                    value={this.state.amount}
                    style={{ marginTop: 3 }}
                    keyboardType="number-pad"
                    maxLength={6}
                    onFocus={() => {
                      this.setState({ borderBottomColorUserName: "#50CAD0" });
                    }}
                    onBlur={() => {
                      this.setState({ borderBottomColorUserName: "#757575" });
                    }}
                    onChangeText={amount => this.setState({ amount })}
                  />
                </Item>
              )}

              <TouchableOpacity onPress={() => this._onPressButton()}>
                <View style={styles.buttonVerifier}>
                  <Text style={styles.buttonText}>SUBMIT</Text>
                </View>
              </TouchableOpacity>
            </Form>
          </Card>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  detailsContainer: {
    flex: 1,
    alignItems: "stretch",
    paddingTop: 25
  },
  cardContainer: {
    flex: 1,
    padding: 15,
    marginTop: 20,
    marginLeft: 10,
    marginRight: 10
  },
  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0"
  },
  inputContainer: {
    height: 100,
    marginBottom: 15,
    flexDirection: "column",
    justifyContent: "space-between"
  },
  inputs: {
    height: 45,
    marginLeft: 5,
    borderBottomWidth: 1,
    flex: 1
  },
  buttonSignUp: {
    marginTop: 10,
    marginBottom: 50,
    backgroundColor: "#0000FF",
    borderRadius: 5,
    flex: 1
  },
  buttonTextSignUp: {
    padding: 10,
    color: "white",
    textAlign: "center"
  },
  buttonOTP: {
    flex: 1,
    flexDirection: "row",
    padding: 8,
    alignItems: "center",
    backgroundColor: "#33B5E5",
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10,
    borderWidth: 0.7,
    borderColor: "#33B5E5"
  },
  buttonTextOTP: {
    paddingLeft: 5,
    color: "white",
    fontSize: 12
  },
  buttonEmail: {
    flex: 1,
    flexDirection: "row",
    padding: 8,
    alignItems: "center",
    backgroundColor: "#33B5E5",
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 0.7,
    borderColor: "#33B5E5"
  },
  buttonTextEmail: {
    padding: 2,
    color: "#FFFFFF",
    fontSize: 12
  },
  buttonEmailOff: {
    flex: 1,
    flexDirection: "row",
    padding: 8,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 0.7,
    borderColor: "#33B5E5"
  },
  buttonTextEmailOff: {
    padding: 2,
    color: "#33B5E5",
    fontSize: 12
  },
  buttonOTPOff: {
    flex: 1,
    flexDirection: "row",
    padding: 8,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10,
    borderWidth: 0.7,
    borderColor: "#33B5E5"
  },
  buttonTextOTPOff: {
    fontSize: 12,
    padding: 2,
    color: "#33B5E5"
  },
  errorMsg: {
    marginLeft: 18,
    fontSize: 12,
    color: "red"
  },
  buttonVerifier: {
    marginTop: 10,
    alignItems: "center",
    backgroundColor: "#0000FF",
    borderRadius: 5
  },
  buttonText: {
    padding: 10,
    color: "white"
  }
});
