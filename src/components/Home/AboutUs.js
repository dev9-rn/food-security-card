import React from 'react';
import { BackHandler, Platform, StyleSheet, View, TouchableOpacity, StatusBar, Linking } from 'react-native';
import { Header, Left, Body, Right, Card, CardItem, Text, Title, Icon } from 'native-base';
import CryptoJS from 'crypto-js';

export default class AboutUs extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            setNavigationScreen: '',
            backgroundColorHeader: '',
            encryptedData: '',
            decryptedData: '',
        };
    }

    componentWillMount() {
        if (this.props.navigation.state.params.screen === "VerifierMainScreen") {
            this.setState({ setNavigationScreen: 'VerifierMainScreen', backgroundColorHeader: '#0000FF' });
        } else {
            this.setState({ setNavigationScreen: 'InstituteMainScreen', backgroundColorHeader: '#D34A44' });
        }

        // Use existing encrypted data
        this.useEncryptedText();
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }

    handleBackPress = () => {
        this.props.navigation.navigate(this.state.setNavigationScreen);
        return true;
    }

    useEncryptedText = () => {
        const secretKey = 'AJITNATH'; // This must be the exact key used for encryption
        const encryptedText = 'U2FsdGVkX19qhk0R6EM4j9Gy+Id0VobRNOhWbbyAZyMVMzMNlSkxr30JXfGoA3d7C9uOfwfFX7t4T/tMbcPHtGYpIVqZRxIhG4dB34Zr58wai1oEtrG6XHawSHjqyL9H'; // Provided encrypted text
    
        this.setState({ encryptedData: encryptedText });
    
        try {
            // Decrypt the encrypted text
            const bytes = CryptoJS.AES.decrypt(encryptedText, secretKey);
            const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    
            // If decryption failed, decryptedData would be empty or invalid
            if (!decryptedData) {
                throw new Error("Decryption failed or returned empty data.");
            }
            this.setState({ decryptedData });
        } catch (error) {
            console.log("Error decrypting data: ", error.message);
            this.setState({ decryptedData: "Decryption failed" });
        }
    }

    _sendMail() {
        Linking.openURL('mailto:software@scube.net.in?subject=Enquiry regarding SeQR scan.');
    }

    _openURL() {
        Linking.openURL('http://scube.net.in');
    }

    _showHeader() {
        return (
            <Header style={{ backgroundColor: this.state.backgroundColorHeader }}>
                <Left>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate(this.state.setNavigationScreen)}>
                        <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
                    </TouchableOpacity>
                </Left>
                <Body>
                    <Title style={{ color: '#FFFFFF' }}>About us</Title>
                </Body>
                <Right />
            </Header>
        );
    }

    render() {
        return (
            <View style={styles.container}>
                {this._showHeader()}

                <StatusBar
                    backgroundColor={this.state.backgroundColorHeader}
                    barStyle="light-content"
                />

                <Card style={{ padding: 10, marginTop: 20 }}>
                    <CardItem>
                        <Body>
                            <Text>
                                S Cube offers a variety of ERP solutions for businesses including banks, e-libraries, document management systems, visa on arrival and land taxation systems etc.
                            </Text>

                            <Text>Feel free to contact us to get a quote.</Text>

                            <TouchableOpacity onPress={() => this._sendMail()}>
                                <Text style={{ paddingTop: 20, color: 'blue' }}>software@scube.net.in</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this._openURL()}>
                                <Text style={{ paddingTop: 20, color: 'blue' }}>http://scube.net.in</Text>
                            </TouchableOpacity>
                            
                        </Body>
                    </CardItem>
                </Card>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
