import React, {Component} from 'react';
import { Dimensions, Platform } from 'react-native';

import { Toast } from 'native-base';

export function checkSpecialChar(str) {
    var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
	
	if(format.test(str)){
	  	return false;
	} else {
	  	return true;
	}
}
	
export function checkMobileNumber(pNumber){
	var reg = /^(?:[5-9]\d*|\d)$/;
	var res = reg.test(pNumber);
	return res;
}

export function checkEmail(pEmail) {
	var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	return filter.test(pEmail);
}

export function showToastMsg(msg){
	Toast.show({
    	text: msg,
      	style: { position: 'absolute', bottom:10,left:10,right:10, borderRadius: 5 }	
    });
}