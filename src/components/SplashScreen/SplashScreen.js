import {createStackNavigator} from 'react-navigation';
import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button} from 'react-native';

export default class SplashScreen extends React.Component{

	test(){
		alert(1);
		// this.props.navigation.navigate('VerifierHome');
	}
	render() {
    	return (
      		<View style={styles.container}>
        		<Text>SplashScreen Page </Text>
        		<Button
          			onPress={()=>this.props.navigation.navigate('VerifierHome')}
		          	title="SIGN IN AS VERIFIER"
		          	color="#841584"
		        />
		        <Button
          			onPress={()=>this.props.navigation.navigate('VerifierHome')}
		          	title="SIGN IN AS INSTITUTE"
		          	color="#841584"
		        />
      		</View>
    	);
  	}
}
const styles = StyleSheet.create({
  	container: {
	    flex: 1,
	    justifyContent: 'center',
	    alignItems: 'center',
	    backgroundColor: '#F5FCFF',
  	},
});