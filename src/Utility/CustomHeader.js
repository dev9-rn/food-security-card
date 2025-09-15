import React, {Component} from 'react';
import { Vibration,  Alert, AsyncStorage, BackHandler, Dimensions, Platform, StyleSheet, View, TextInput, Image, TouchableOpacity, StatusBar, Linking } from 'react-native';
import { Container, Header, Left, Body, Right, Content, Card, CardItem, Text, Title, Item, Icon, Toast } from 'native-base';

export default class CustomHeader extends React.Component{

  constructor(props) {
    super(props);
    this.state = {
      title: this.props.title,
      navigateTo: this.props.navigateTo,
      headerStyle: this.props.style

    };
  }

  render(){
    return(
      <View>
        <Header style={this.props.headerStyle}>
          <Left> 
            <TouchableOpacity onPress={()=> this.props.prop.navigation.navigate(this.props.navigateTo)}> 
              <Icon type="FontAwesome" name="long-arrow-left" style={styles.iconStyle}/>
            </TouchableOpacity>
          </Left>
          <Body style={this.props.bodyStyle}> 
            <Title style={{ color: '#FFFFFF', fontSize: 16 }}>{this.props.bodyTitle}</Title>
          </Body>
          <Right>{this.props.rightContent}</Right>
        </Header>
      </View>
    )}
  }

const styles = StyleSheet.create({
  iconStyle:{
    fontSize: 25, 
    color: '#FFFFFF',
    paddingLeft: 10, 
    paddingRight: 10 
  }
})


// <View>
//         { Platform.OS == 'ios' ?
//           <Header style={this.state.headerStyle}>
//             <Left> 
//               <TouchableOpacity onPress={()=> this.props.prop.navigation.navigate(this.state.navigateTo)}> 
//                 <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF',paddingLeft: 10, paddingRight: 10 }}/>
//               </TouchableOpacity>
//             </Left>
//             <Body> 
//               <Title style={{ color: '#FFFFFF'}}>{this.state.title}</Title>
//             </Body>                 
//             <Right />
//           </Header>
//         :
//           <Header style={{backgroundColor: '#D34A44'}}>
//             <Left>
//               <TouchableOpacity onPress={()=> this.props.prop.navigation.navigate(this.state.navigateTo)}> 
//                 <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF',paddingLeft: 10, paddingRight: 10 }}/>
//               </TouchableOpacity>
//             </Left>
//             <Body>
//               <Title style={{ color: '#FFFFFF',fontSize: 16}}>{this.state.title}</Title>
//             </Body>
//             <Right />
//           </Header>
//         }
//       </View>