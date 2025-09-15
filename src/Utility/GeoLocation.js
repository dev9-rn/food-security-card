
import React, {Component} from 'react';

export var LAT = '';
export var LONG = '';
export var LOC_ERROR = '';

export default class GeoLocation extends React.Component{
	
	constructor(props) {
		debugger;
	  	super(props);
	
	  	this.state = {
	  		latitude: null,
	      	longitude: null,
	      	locationError: null,
	  	};
	}

	componentDidMount() {
		debugger;
    	navigator.geolocation.getCurrentPosition(
	      	(position) => {
	        	
	        	LAT = position.coords.latitude;
	        	LONG = position.coords.latitude;
	        	LOC_ERROR = null;
	        	console.log("LAT : " + LAT);
	      	},
	      	(error) => {
	      		this.setState({ locationError: error.message });
	      		LOC_ERROR = error.message;
	      	},
	      	{ enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    	);
  	}

  	componentWillUnmount() {
    	navigator.geolocation.clearWatch(this.watchId);
  	}

	
}
