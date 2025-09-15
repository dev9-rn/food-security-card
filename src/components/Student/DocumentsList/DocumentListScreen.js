import React, {Component} from 'react';
import { FlatList, Alert, BackHandler, Dimensions, Platform, StyleSheet, View, TextInput, Image, TouchableOpacity, StatusBar } from 'react-native';
import { Container, Header, Left, Body, Right, Title, Content, Card, CardItem, Text, Item, Icon, Toast, List, ListItem } from 'native-base';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import Pdf from 'react-native-pdf';
import StudentService from '../../../services/StudentService/StudentService';
import OfflineNotice from '../../../Utility/OfflineNotice';
import Loader from '../../../Utility/Loader';
import CustomHeader from '../../../Utility/CustomHeader';
import * as utilities from '../../../Utility/utilities';
import * as app from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default class DocumentListScreen extends React.Component{

	constructor(props) {
  		super(props);
		this.enrollmentNo = '';
		this.sessionKey = '';
		this.studentId = '';
	  	this.state = {
	  		data: [],
	  		deleteItem: false,
	  		loading: false,
	  		loaderText:'',
	  	};
	}

	componentWillMount(){
		this._getAsyncData();
		
	}
	componentDidMount(){
		// this._getAsyncData();
		// this.setState({data: app.notificationData});
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
	}
	componentWillUnMount(){
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
	}
	
	handleBackPress = () => {
  		Alert.alert(
  			'Closing Activity',
  			'Are you sure you want to close this activity?',
		  	[
		    	{text: 'NO', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
		    	{text: 'YES', onPress: () => BackHandler.exitApp()},
		  	],
		  	{ cancelable: false }
		);
    	
    	return true;
  	}

	closeActivityIndicator() {
   		setTimeout(() => {
    		this.setState({loading: false});
   		});
 	}

 	async _getAsyncData(){
 		await AsyncStorage.getItem('USERDATA',(err,result)=>{
  			var lData = JSON.parse(result);
  			if (lData) {
  				this.enrollmentNo = lData.enrollment_no;
  				this.studentId = lData.student_id;
  				this.sessionKey = lData.sesskey;
  				this._getDocumentList();
  			}
  		});
 	}

 	async _callForLogoutAPI(){
 		 ;
 		const formData = new FormData();
		formData.append('user_id', this.state.student_id);
		formData.append('sesskey', this.state.sessionKey);

		var studentApiObj = new StudentService();	
		this.setState({loading: true});
		await studentApiObj.logOut(formData);
		var lResponseData = studentApiObj.getRespData();
		 ;
		this.closeActivityIndicator();
		console.log(lResponseData);

		if(!lResponseData){
			utilities.showToastMsg('Something went wrong. Please try again later');
		}else if (lResponseData.status == 'true') {
			
			AsyncStorage.clear();
			this.props.navigation.navigate('HomeScreen');
			utilities.showToastMsg('Logged out successfully');
		} else {
			utilities.showToastMsg('Something went wrong. Please try again later');
		}

 	}

 	_aboutUs(){
		this.props.navigation.navigate('AboutUs');
	}

	_logOut(){
		if (app.ISNETCONNECTED) {
			this._callForLogoutAPI();
		}else{
			utilities.showToastMsg('No network available! Please check the connectivity settings and try again.');
		}
		// alert(4);
	}


	async _getDocumentList(){
		let lEnrollmentNo = this.enrollmentNo;

		const formData = new FormData();
		formData.append('enrollno', lEnrollmentNo);

		console.log(formData);
		var studentApiObj = new StudentService();

		this.setState({loading: true});

		await studentApiObj.getDocuments(formData);
		var lResponseData = studentApiObj.getRespData();
		this.closeActivityIndicator(); 
		 debugger;
		console.log(lResponseData);	
		if(!lResponseData){
			utilities.showToastMsg('Something went wrong. Please try again later');
		}else if(lResponseData.status == "false"){
			utilities.showToastMsg(lResponseData.message);
		}else if(lResponseData.status == 'true'){
			try {
			    this.setState({data : lResponseData.Data});
		   	} catch (error) {
			    console.warn(error);
			}
		}else{
			utilities.showToastMsg('Something went wrong. Please try again later');
		}
	}

	_onClickItem(pItem){
		debugger;
		this.props.navigation.navigate('DocumentViewScreen',{docURL: pItem.url, docNo: pItem.document_no});
	}

	_displayList(){
		
		var items = this.state.data;
		
		if (items.length == 0) {
			return(
				<View style={styles.noRecord}>
					<Text style={{ fontSize: 28, color: '#BDBDBD' }}>No documents available!</Text>
				</View>
			)
		}else{
			
			return(
				<View>
		          	<FlatList
						data={this.state.data}
						extraData={this.state}
						key={(item, index) => item.index}
						keyExtractor={(item, index) => item.index}
  						renderItem={({item, index }) => 
  							<ListItem key={index} style={{flexDirection:  'column',alignItems: 'center' }}>
  								<Card>
	  								<TouchableOpacity onPress={()=>{ this._onClickItem(item) }}>
	  									<View style={{ backgroundColor: 'grey', width: Dimensions.get('window').width * 0.3, height: Dimensions.get('window').height * 0.2 }}>
			  								<Pdf
							                    source={{uri: item.url, cache:true}}
							                    onLoadComplete={(numberOfPages,filePath)=>{
							                        console.log(`number of pages: ${numberOfPages}`);
							                    }}
							                    onPageChanged={(page,numberOfPages)=>{
							                        console.log(`current page: ${page}`);
							                    }}
							                    onError={(error)=>{
							                        console.log(error);
							                    }}
							                    style={styles.pdf}/>
			              				</View>
		              				</TouchableOpacity>
			                    </Card>
			                    <Text key={index} style={{ fontSize: 14 }}>Document Id: {item.document_no}</Text>
		              		</ListItem>
  						}
					/>
		        </View>
			)
		}
	}

	render(){
		return(
			<View style={styles.container}>

				<Header style={{backgroundColor: '#68228B'}}>
					
		  			<Body style={{ flex: 0.9, alignItems: 'center' }}>
		  				<Title style={{ color: '#FFFFFF',paddingLeft: 20}}>Documents</Title>
		  			</Body>           			
		  			<Right style={{ flex: 0.1 }}>
		  				<Menu>
				      		<MenuTrigger>
				      			<Image 
		      						style={{ width: 20, height: 20 ,paddingRight: 15 }}
		      						source={require('../../../images/three_dots.png' )}
	      						/>
				      		</MenuTrigger>
					      	<MenuOptions>
						        <MenuOption onSelect={() => this._aboutUs()} style={{padding:15}}>
						        	<Text style={{color: 'black'}}>About us</Text>
						        </MenuOption>
						        <MenuOption onSelect={() => this._logOut()} style={{padding:15}} >
					          		<Text style={{color: 'black'}}>Logout</Text>
				        		</MenuOption>
					      	</MenuOptions>
						</Menu>
		  			</Right>
				</Header>

	  			<OfflineNotice />
				<StatusBar
					backgroundColor='#68228B'
			    	barStyle="light-content"
   				/>
   				<Loader
   					loading={this.state.loading}
   					text={this.state.loaderText}
				/>

				<View style={styles.container}>
			        { this._displayList() }
		      	</View>

	    	</View>
	)}
}

const styles = StyleSheet.create({
  	container: {
	    flex: 1,
        
 	},
 	noRecord: {
 		flex: 1,
 		flexDirection: 'column',
        alignItems:'center',
        justifyContent: 'center'
 	},
 	pdf: {
        flex:1,
    }
 });

 // <TouchableOpacity onPress={()=>{this._onClickItem(item)}}>
	// 	  								<View key={index} style={{}} >
	// 			    	            		<Text key={index} style={{ alignSelf: 'flex-start', fontSize: 14 }}>Document Id: {item.document_no}</Text>
	// 		              				</View>
	// 	              				</TouchableOpacity>
