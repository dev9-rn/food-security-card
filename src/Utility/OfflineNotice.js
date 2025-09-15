
import React, { PureComponent } from 'react';
import { View, Text,  Dimensions, StyleSheet } from 'react-native';
const { width } = Dimensions.get('window');
function MiniOfflineSign() {
  return (
    <View style={styles.offlineContainer}>
      <Text style={styles.offlineText}>No Internet Connection</Text>
    </View>
  );
}
class OfflineNotice extends PureComponent {

   state = {
    isConnected: true
  };

  
  handleConnectivityChange = isConnected => {
    
    if (isConnected) {
      // alert(isConnected);
      this.setState({ isConnected });
    } else {
      // alert(isConnected)
      this.setState({ isConnected });
    }
  };
 
  render() {
    if (!this.state.isConnected) {
      return <MiniOfflineSign />;
    }
    return null;
  }
}
const styles = StyleSheet.create({
  offlineContainer: {
    backgroundColor: '#b52424',
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width,
    position: 'absolute',
    top: 55,
    zIndex: 1
  },
  offlineText: { 
    color: '#fff'
  }
});
export default OfflineNotice;
