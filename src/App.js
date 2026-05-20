import React, { Component } from 'react';
import { Root } from "native-base";
import Route from '../src/config/Route';
import { MenuProvider } from 'react-native-popup-menu';

export default class App extends Component {
  render() {
    return (
      <Root>
        <MenuProvider>
          <Route />
        </MenuProvider>
      </Root>
    );
  }
};

export const URL = "https://demo.seqrdoc.com/api/";
// export const URL = "https://newserver.seqrdoc.com/api/";

export const title = "Food Security Card";

export const HEADER = {
  Accept: 'application\/json',
  'Content-Type': 'multipart\/form-data',
  apikey: "GSka~2nu@D,knVOfz{+/RL1WMF{bka"
};
export var scanQRData = [];
export var scanSeQRData = [];
export var ISNETCONNECTED = true;
export function setValue(newValue: Boolean) {
  ISNETCONNECTED = newValue;
}