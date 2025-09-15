import React, {Component} from 'react';
import {  Alert, StatusBar, AsyncStorage, BackHandler, Dimensions, Platform, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Container, Header, Left, Body, Right, Content, Text, 
			Title, Toast, Icon } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import VerifierService from '../../../services/VerifierService/VerifierService';

import OfflineNotice from '../../../Utility/OfflineNotice';
import Loader from '../../../Utility/Loader';
import * as utilities from '../../../Utility/utilities';
import * as app from '../../../App';

export default class FailedTransaction extends React.Component{

    constructor(props) {
    	super(props);
        this.state = { 
        	url: '',
        	transactionId: ''
        }
    }
    componentDidMount() {
    	
        const { state } = this.props.navigation;
        var paymentRes = state.params.paymentResponse;
        this.setState({transactionId : paymentRes.payments[0].payment_id});
    }

    _showHeader(){
		if(Platform.OS == 'ios'){
			return(
				<Header style={{backgroundColor: '#0000FF'}}>
					
		  			<Body style={{ flex: 0.9 }}> 
		  				<Title style={{ color: '#FFFFFF'}}>Payment status</Title>
		  			</Body>           			
		  			
				</Header>
			)
		} else {
			return(
				<Header style={{backgroundColor: '#0000FF'}}>
					
					<Body style={{ flex: 0.9, alignItems: 'center',}}>
						<Title style={{ color: '#FFFFFF', fontSize: 16, marginLeft: -10}}>Payment status</Title>
					</Body>            			
		  			
				</Header>
			)
		}
	}

    render() {

        return (
        	<View style={styles.container}>

				{ this._showHeader() }
				<OfflineNotice />
				<StatusBar
			    	barStyle="light-content"
   				/>

	            <View style={{ flex: 1, padding: 10}}>
	            	<Text style={{color: 'red', paddingTop: 10}}>Transaction Failed</Text>
	            	<Text style={{marginTop: 50}}>Please retry.</Text>
	            	<Text style={{marginTop: 20, textAlign: 'center'}}>Thank You !!</Text>
	            	<TouchableOpacity style={{marginTop: 20}} onPress={()=>{ this.props.navigation.navigate('VerifierMainScreen') }}>
	            		<View style={styles.buttonOK}>
	            			<Text style={styles.buttonText}>OK</Text>
		          		</View>
	            	</TouchableOpacity>
	            </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
  	container: {
	    flex: 1,
 	},
 	buttonOK: {
	    marginTop: 10,
	    alignItems: 'center',
	    backgroundColor: '#0000FF',
	    borderRadius: 5
  	},
  	buttonText: {
    	padding: 10,
    	color: 'white',
  	}
})
