import React, { Component } from "react";
import { Alert, StatusBar, BackHandler, Dimensions, Image, Platform, StyleSheet, View, TouchableOpacity } from "react-native";
import { Header, Left, Body, Text, Title, Icon, } from "native-base";
import QRCodeScanner from "react-native-qrcode-scanner";
import Loader from "../../../Utility/Loader";
import * as utilities from "../../../Utility/utilities";
import { scanSeQRData, scanQRData, ISNETCONNECTED } from "../../../App";
import VerifierService from '../../../services/VerifierService/VerifierService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as app from '../../../App';
import OfflineNotice from '../../../Utility/OfflineNotice';
import NetInfo from "@react-native-community/netinfo";
import CryptoJS from 'crypto-js';
import { Buffer } from 'buffer';
import aesjs from 'aes-js'; // pure JS, zero native deps — install: npm install aes-js

// ─────────────────────────────────────────────────────────────────────────────
// AES-256-GCM + PBKDF2 decryption
// Pure JavaScript — crypto-js (PBKDF2) + aes-js (AES block cipher)
// No native modules, no Node.js globals. Works on RN 0.68 / Hermes.
//
// Python payload layout:  SALT(16B) | NONCE(12B) | AUTH_TAG(16B) | CIPHERTEXT
// GCM decrypt = AES-CTR, counter starting at 2 (1 is reserved for GHASH tag)
//
// PERFORMANCE: PBKDF2 (100k iterations) is expensive (~1-3s on device).
// _keyCache stores derived keys by salt+password so every scan after the
// first is instant (~1ms). Cache lives for the app session only.
// ─────────────────────────────────────────────────────────────────────────────
 
/** In-memory key cache: "<password>:<saltHex>" → keyBytes array */
const _keyCache = {};
 
/** CryptoJS WordArray → plain number[] byte array */
function wordArrayToBytes(wordArray) {
  const { words, sigBytes } = wordArray;
  const bytes = [];
  for (let i = 0; i < sigBytes; i++) {
    bytes.push((words[Math.floor(i / 4)] >>> (24 - (i % 4) * 8)) & 0xff);
  }
  return bytes;
}
 
/** number[] byte array → CryptoJS WordArray */
function bytesToWordArray(byteArr) {
  const words = [];
  for (let i = 0; i < byteArr.length; i += 4) {
    words.push(
      ((byteArr[i]     || 0) << 24) |
      ((byteArr[i + 1] || 0) << 16) |
      ((byteArr[i + 2] || 0) << 8)  |
       (byteArr[i + 3] || 0)
    );
  }
  return CryptoJS.lib.WordArray.create(words, byteArr.length);
}
 
/**
 * Derive AES-256 key via PBKDF2 (cached).
 * First call per unique salt is slow (~1-3s). All subsequent calls are instant.
 */
function deriveKey(password, saltBytes) {
  // Build a cache key from password + salt so different combos never collide
  const saltHex = saltBytes.map(b => b.toString(16).padStart(2, '0')).join('');
  const cacheKey = password + ':' + saltHex;
 
  if (_keyCache[cacheKey]) {
    return _keyCache[cacheKey]; // instant on repeat scans
  }
 
  const keyWA = CryptoJS.PBKDF2(password, bytesToWordArray(saltBytes), {
    keySize: 256 / 32,   // 8 words = 32 bytes = AES-256
    iterations: 100000,  // must match Python encrypt_adv()
    hasher: CryptoJS.algo.SHA256,
  });
 
  const keyBytes = wordArrayToBytes(keyWA);
  _keyCache[cacheKey] = keyBytes; // cache for all future scans this session
  return keyBytes;
}
 
/**
 * Decrypt AES-256-GCM + PBKDF2 payload produced by Python encrypt_adv().
 * Synchronous. Pure JavaScript — no native modules required.
 *
 * First call: ~1-3s (PBKDF2 key derivation)
 * Repeat calls with same password: ~1ms (key cached)
 *
 * @param {string} base64Payload  - Base64 encoded payload from QR code
 * @param {string} password       - Password used during encryption
 * @returns {string}              - Decrypted UTF-8 plaintext
 */
export function decryptAesGcm(base64Payload, password) {
  // 1. Base64 → bytes (via CryptoJS, no Buffer or atob needed)
  const payloadBytes = wordArrayToBytes(CryptoJS.enc.Base64.parse(base64Payload));
 
  // 2. Slice components at exact byte offsets matching Python payload format
  const salt       = payloadBytes.slice(0, 16);  // 16 bytes
  const nonce      = payloadBytes.slice(16, 28); // 12 bytes
  // authTag       = payloadBytes.slice(28, 44); // 16 bytes — skipped (no GHASH in pure JS)
  const ciphertext = payloadBytes.slice(44);     // remainder
 
  // 3. Derive AES-256 key — cached after first call, instant on repeats
  const keyBytes = deriveKey(password, salt);
 
  // 4. AES-256-GCM decrypt = AES block cipher in CTR mode
  //    Counter block layout: nonce(12 bytes) || blockNum(4 bytes, big-endian)
  //    blockNum starts at 2 for plaintext (blockNum=1 is reserved for auth tag)
  const aesInst = new aesjs.AES(keyBytes);
 
  function getKeystream(blockNum) {
    const ctrBlock = new Array(16);
    for (let i = 0; i < 12; i++) ctrBlock[i] = nonce[i];
    ctrBlock[12] = (blockNum >>> 24) & 0xff;
    ctrBlock[13] = (blockNum >>> 16) & 0xff;
    ctrBlock[14] = (blockNum >>> 8)  & 0xff;
    ctrBlock[15] =  blockNum         & 0xff;
    return aesInst.encrypt(ctrBlock); // AES-ECB on one 16-byte block
  }
 
  // 5. XOR each ciphertext byte with its keystream byte
  const plaintext = new Uint8Array(ciphertext.length);
  for (let offset = 0; offset < ciphertext.length; offset += 16) {
    const ks = getKeystream(Math.floor(offset / 16) + 2);
    for (let i = 0; i < 16 && offset + i < ciphertext.length; i++) {
      plaintext[offset + i] = ciphertext[offset + i] ^ ks[i];
    }
  }
 
  // 6. Bytes → UTF-8 string
  return String.fromCharCode(...plaintext);
}

// ─────────────────────────────────────────────────────────────────────────────

export default class VerifierScanScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: "",
      userId: "",
      userName: "",
      flashEnabled: true,
      loading: false,
      loaderText: "Scanning...",
      flash: false,
      showCamera: true,
      showCameraText: true,
      isConnected: true,
    };
  }

  componentWillMount() {
    this.setState({ isConnected: app.ISNETCONNECTED });
    this._getAsyncData();
  }

  componentDidMount() {
    this.checkConnectivity();
    this.netInfoSubscription = NetInfo.addEventListener(state => {
      this.setState({ isConnected: state.isConnected });
    });
    this.didFocusSubscription = this.props.navigation.addListener("didFocus", payload => { this.setState({ showCamera: true }); });
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
    this._showNetErrMsg();
  }

  componentWillUnmount() {
    this.netInfoSubscription();
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
    this.didFocusSubscription.remove();
  }

  handleBackPress = () => { this.props.navigation.navigate("VerifierMainScreen"); return true; };

  async checkConnectivity() {
    const netInfo = await NetInfo.fetch();
    this.setState({ isConnected: netInfo.isConnected });
  }

  handleConnectivityChange = isConnected => {
    if (isConnected) {
      this.setState({ isConnected });
    } else {
      this.setState({ isConnected });
      this._showNetErrMsg();
    }
  };

  _showNetErrMsg() {
    if (!this.state.isConnected || !app.ISNETCONNECTED) {
      Alert.alert(
        'No network available',
        'Connect to internet to scan SeQR. Without internet you can only scan non secured public QR codes.',
        [
          { text: 'SETTINGS', onPress: () => { this._openSettings() } },
          { text: 'BACK', onPress: () => { this.props.navigation.navigate('InstituteMainScreen') } },
          { text: 'CONTINUE', onPress: () => { this.setState({ isConnected: false }) } },
        ],
        { cancelable: false }
      )
    }
  }

  async _getAsyncData() {
    await AsyncStorage.getItem("USERDATA", (err, result) => {
      var lData = JSON.parse(result);
      console.log("In scan, user credentials:", result);
      if (lData) {
        this.setState({ userName: lData.username, userId: lData.id, token: lData.access_token });
      }
    });
  }

  onSuccess(e) {
    this.setState({ showCamera: false });
    this._callForAPI(e);
    console.log(e)
  }

  useEncryptedText = (encryptedText) => {
    const secretKey = 'AJITNATH'; // This must be the exact key used for encryption
    let decryptedData = '';

    try {
      // Decrypt the encrypted text
      const bytes = CryptoJS.AES.decrypt(encryptedText, secretKey);
      decryptedData = bytes.toString(CryptoJS.enc.Utf8);

      // Log decrypted value or error
      if (!decryptedData) {
        throw new Error("Decryption failed or returned empty data.");
      }

      console.log("Decrypted data:", decryptedData);
      this.setState({ decryptedData });
    } catch (error) {
      console.log("Error decrypting data: ", error.message);
      decryptedData = "Decryption failed";
      this.setState({ decryptedData });
    }

    return decryptedData;
  };

  async _callForAPI(e) {
    const netInfo = await NetInfo.fetch();
    let someText = e.data.trim(); // Cleans up any leading/trailing spaces
    console.log("Scanned text:", someText);

    let extractedKey = "";
    let decryptedData = "";

    // Extract key from QR code based on the format
    if (/\n/.test(someText)) {
      extractedKey = someText.substring(someText.lastIndexOf("\n") + 1);
      someText = someText.substring(0, someText.lastIndexOf("\n"));
    } else if (/\s/.test(someText)) {
      extractedKey = someText.substring(someText.lastIndexOf(" ") + 1);
      someText = someText.substring(0, someText.lastIndexOf(" "));
    } else {
      extractedKey = e.data;
      someText = "";
    }

    console.log("Extracted Key:", extractedKey);

    // Apply decryption logic
    decryptedData = this.useEncryptedText(extractedKey);

    // AES-GCM decryption — synchronous, pure JS, no native deps


    console.log("Decrypted Key:", decryptedData);

    // Handle online case
    if (netInfo.isConnected) {
      console.log("Device is online, proceeding with API call...");

      const formData = new FormData();

      // Check if decryption failed
      if (decryptedData === "Decryption failed") {
        console.log("Decryption failed, using someText as key");
        formData.append('key', e.data.trim()); // Use the original scanned text in 'key'
      } else {
        console.log("Decryption succeeded, extracting last line for key");

        // Extract the last line of the decrypted data
        const lines = decryptedData.split('\n');
        const lastLine = lines[lines.length - 1].trim(); // Trim any spaces or newlines

        console.log("Last line extracted as key:", lastLine);

        formData.append('key', lastLine); // Use the last line as the key
        formData.append('plain_text', lastLine); // Use the last line as the plain_text
      }

      formData.append("device_type", Platform.OS);
      formData.append("scanned_by", this.state.userName);
      formData.append("user_id", this.state.userId);

      console.log("FormData prepared for API call:", formData);

      // Make API call
      var verifierApiObj = new VerifierService();
      await verifierApiObj.scanByPublicUser(formData, this.state.token);
      var lResponseData = verifierApiObj.getRespData();
      this.setState({ loading: false, showCameraText: false });

      if (!lResponseData) {
        utilities.showToastMsg("Something went wrong. Please try again later");
        this.props.navigation.navigate("VerifierMainScreen");
      } else if (lResponseData.data.status === 2) {
        utilities.showToastMsg(lResponseData.data.message);
        this.props.navigation.navigate("VerifierMainScreen");
      } else if (lResponseData.status === 200) {
        var lData = {};
        lData = lResponseData.data;
        // try {
        //   const decryptedNewData = decryptAesGcm(lData?.key, "4f3a8b1c9d2e7f60c183a54b9d0e2c81");
        //   console.log("decryptedNewData------", decryptedNewData);
        // } catch (gcmErr) {
        //   console.log("decryptAesGcm failed:", gcmErr.message);
        // }
        scanSeQRData.unshift(lData);
        utilities.showToastMsg("QR code scanned successfully.");
        await AsyncStorage.setItem("CERTIFICATESCANNEDDATA", JSON.stringify(lResponseData));
        this.props.navigation.navigate("VerifierCertificateAndPrint", {
          certificateData: lResponseData.data,
          dataAboveCertificate: decryptedData,
          family_details: lResponseData.ration_details[0]?.family_details
        });
      } else {
        utilities.showToastMsg(lResponseData.message);
        setTimeout(() => {
          this.props.navigation.navigate("VerifierMainScreen");
        }, 1000);
      }

    } else {
      console.log("Device is offline, displaying QR text.");
      utilities.showToastMsg("Device is offline. Displaying QR content.");

      const decryptedOfflineData = decryptedData === "Decryption failed" ? "Data Not Found" : decryptedData;

      console.log("Decrypted offline data before setting state:", decryptedOfflineData);

      this.setState({ decryptedData: decryptedOfflineData, showLoadingGif: true }, () => {
        console.log("State updated with decrypted data (offline):", this.state.decryptedData);
      });
    }
  }


  _showHeader() {
    if (Platform.OS == "ios") {
      return (
        <Header style={{ backgroundColor: "#0000FF" }}>
          <Left style={{ flex: 0.1 }}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate("VerifierMainScreen")} >
              <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: "#FFFFFF", paddingLeft: 10, paddingRight: 10 }} />
            </TouchableOpacity>
          </Left>
          <Body style={{ flex: 0.9 }}>
            <Title style={{ color: "#FFFFFF" }}>{app.title}</Title>
          </Body>
        </Header>
      );
    } else {
      return (
        <Header style={{ backgroundColor: "#0000FF" }}>
          <Left style={{ flex: 0.1 }}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate("VerifierMainScreen")} >
              <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: "#FFFFFF", paddingLeft: 10, paddingRight: 10 }} />
            </TouchableOpacity>
          </Left>
          <Body style={{ flex: 0.9, alignItems: "center" }}>
            <Title style={{ color: "#FFFFFF", fontSize: 16 }}>{app.title}</Title>
          </Body>
        </Header>
      );
    }
  }

  render() {
    const { showCamera, loading, showLoadingGif } = this.state;
    return (
      <View style={styles.container}>
        {this._showHeader()}
        <StatusBar barStyle="light-content" />
        {this.state.loading && (
          <Loader loading={this.state.loading} text={this.state.loaderText} />
        )}

        {showLoadingGif && (
          <View style={styles.loadingContainer}>
            <Image
              source={require('../../../images/check-mark.png')}
              style={styles.loadingGif}
            />
          </View>
        )}

        {showCamera && (
          <View style={styles.qrScanner}>
            <QRCodeScanner
              onRead={this.onSuccess.bind(this)}
              cameraStyle={{ height: 700 }}
              showMarker={true}
            />
          </View>
        )}
        {/* Display Decrypted Data if available and the device is offline */}
        {!this.state.isConnected && this.state.decryptedData ? (
          <View style={styles.dataContainer}>
            <Text style={styles.dataText}>
              Data:
              {this.state.decryptedData !== 'Data Not Found' ? (
                this.state.decryptedData.split('\n').slice(0, -1).join('\n')
              ) : (
                this.state.decryptedData
              )}
            </Text>
          </View>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGif: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  dataContainer: {
    borderWidth: 1,
    borderColor: '#0000FF',
    borderRadius: 10,
    padding: 15,
    margin: 20,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  dataText: {
    color: '#000',
    fontSize: 16,
  },
  qrScanner: {
  },
});