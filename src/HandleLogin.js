import React from 'react';
import {  View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HandleLogin = props => {
    const getUserdata = async () => {
        await AsyncStorage.multiGet(["USERDATA"], (err, result) => {
            var lData = JSON.parse(result[0][1]);
            if (lData) {
                if (lData.loginedBy === "Institute") {
                    props.navigation.navigate("InstituteMainScreen");
                } else {
                    props.navigation.navigate("VerifierMainScreen");
                }
            } else {
                props.navigation.navigate("HomeScreen");
            }
        });
    }
    React.useEffect(() => {
        getUserdata();
    })
    return (
        <View />
    )
}
export default HandleLogin;