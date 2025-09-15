import React, { Component } from 'react';
import {
 ActivityIndicator,
 View,
 StyleSheet
} from 'react-native';

export default class ActivityIndicatorUtility extends Component {
	render(){
		return (
		    <View style = {styles.ActivityContainer}>
		    	<ActivityIndicator 
		    		animating = {this.props.animating}
		     		style = {styles.activityIndicator} size = "large"
	    		/>
			</View>
		);
	}
}

const styles = StyleSheet.create ({
	ActivityContainer:{
	   flex: 1,
	   justifyContent: 'center',
	   alignItems: 'center',
	   marginTop: 70
 	},
 	activityIndicator: {
   		flex: 1,
   		justifyContent: 'center',
   		alignItems: 'center',
   		height: 80
 	}
})