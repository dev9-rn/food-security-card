import {
  createStackNavigator,
  createAppContainer,
  createDrawerNavigator
} from "react-navigation";
import React, { Component } from "react";
import { Platform, StyleSheet, Text, View, Button } from "react-native";

import HomeScreen from "../components/Home/HomeScreen";
import AboutUs from "../components/Home/AboutUs";
import SplashScreen from "../components/SplashScreen/SplashScreen";
import RemoveAccount from "../components/Home/RemoveAccount";
// import VerifierHome from '../components/Verifier/VerifierHome';
import InstituteMainScreen from "../components/Institute/MainScreen/InstituteMainScreen";
import InstituteLoginScreen from "../components/Institute/Login/InstituteLoginScreen";
import InstituteScanScreen from "../components/Institute/Scan/InstituteScanScreen";
import InstituteAuditScanScreen from "../components/Institute/AuditScan/InstituteAuditScanScreen";
import InstituteCertificateViewScreen from "../components/Institute/InstituteCertificateViewScreen/InstituteCertificateViewScreen";
import InstituteCertificateAndPrint from '../components/Institute/InstituteCertificateViewScreen/InstituteCertificateAndPrint';
import InstituteAuditViewScreen from "../components/Institute/AuditScan/InstituteAuditViewScreen";

import VerifierMainScreen from "../components/Verifier/MainScreen/VerifierMainScreen";
import VerifierLoginScreen from "../components/Verifier/Login/VerifierLoginScreen";
import SignUpScreen from "../components/Verifier/SignUp/SignUpScreen";
import OTPVerification from "../components/Verifier/OTPVerification/OTPVerification";
import VerifierScanScreen from "../components/Verifier/Scan/VerifierScanScreen";
import CertificateViewScreen from "../components/Verifier/CertificateViewScreen/CertificateViewScreen";
import VerifierCertificateAndPrint from '../components/Verifier/CertificateViewScreen/VerifierCertificateAndPrint';
import VerifierHistoryScreen from "../components/Verifier/History/VerifierHistoryScreen";
import PaymentDetailsScreen from "../components/Verifier/Scan/PaymentDetailsScreen";
import PaymentWebView from "../components/Verifier/Scan/PaymentWebView";
import SuccessTransaction from "../components/Verifier/Scan/SuccessTransaction";
import FailedTransaction from "../components/Verifier/Scan/FailedTransaction";

import StudentLoginScreen from "../components/Student/Login/StudentLoginScreen";
import DocumentListScreen from "../components/Student/DocumentsList/DocumentListScreen";
import DocumentViewScreen from "../components/Student/DocumentViewScreen/DocumentViewScreen";
import HandleLogin from "../HandleLogin";
import Tab1 from "../components/Verifier/History/Tab1";

const MainNavigator = createStackNavigator(
  {
    HandleLogin: { screen: HandleLogin, navigationOptions: { header: null } },
    AboutUs: { screen: AboutUs, navigationOptions: { header: null } },
    RemoveAccount: { screen: RemoveAccount, navigationOptions: { header: null } },
    HomeScreen: { screen: HomeScreen, navigationOptions: { header: null } },
    SplashScreen: { screen: SplashScreen },

    InstitueLoginScreen: {
      screen: InstituteLoginScreen,
      navigationOptions: { header: null }
    },
    InstituteMainScreen: {
      screen: InstituteMainScreen,
      navigationOptions: { header: null }
    },
    InstituteScanScreen: {
      screen: InstituteScanScreen,
      navigationOptions: { header: null }
    },
    InstituteAuditScanScreen: {
      screen: InstituteAuditScanScreen,
      navigationOptions: { header: null }
    },
    InstituteCertificateViewScreen: {
      screen: InstituteCertificateViewScreen,
      navigationOptions: { header: null }
    },
    InstituteCertificateAndPrint: { screen: InstituteCertificateAndPrint, navigationOptions: { header: null } },
    InstituteAuditViewScreen: {
      screen: InstituteAuditViewScreen,
      navigationOptions: { header: null }
    },

    VerifierLoginScreen: {
      screen: VerifierLoginScreen,
      navigationOptions: { header: null }
    },
    SignUpScreen: { screen: SignUpScreen, navigationOptions: { header: null } },
    OTPVerification: {
      screen: OTPVerification,
      navigationOptions: { header: null }
    },
    VerifierMainScreen: {
      screen: VerifierMainScreen,
      navigationOptions: { header: null }
    },

    VerifierScanScreen: {
      screen: VerifierScanScreen,
      navigationOptions: { header: null }
    },
    CertificateViewScreen: {
      screen: CertificateViewScreen,
      navigationOptions: { header: null }
    },
    VerifierCertificateAndPrint: { screen: VerifierCertificateAndPrint, navigationOptions: { header: null } },
    VerifierHistoryScreen: {
      screen: VerifierHistoryScreen,
      navigationOptions: { header: null }
    },
    PaymentDetailsScreen: {
      screen: PaymentDetailsScreen,
      navigationOptions: { header: null }
    },
    PaymentWebView: {
      screen: PaymentWebView,
      navigationOptions: { header: null }
    },
    SuccessTransaction: {
      screen: SuccessTransaction,
      navigationOptions: { header: null }
    },
    FailedTransaction: {
      screen: FailedTransaction,
      navigationOptions: { header: null }
    },

    StudentLoginScreen: {
      screen: StudentLoginScreen,
      navigationOptions: { header: null }
    },
    DocumentListScreen: {
      screen: DocumentListScreen,
      navigationOptions: { header: null }
    },
    DocumentViewScreen: {
      screen: DocumentViewScreen,
      navigationOptions: { header: null }
    },
    DocumentViewScreen: {
      screen: Tab1,
      navigationOptions: { header: null }
    },
  },
  {
    // initialRouteName: "HomeScreen",
    initialRouteName: "HandleLogin",
    // headerMode: "float"
  }
);
const Route = createAppContainer(MainNavigator);
export default Route;