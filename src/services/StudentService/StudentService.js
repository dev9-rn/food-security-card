
import { URL, HEADER } from '../../App';

class StudentService{
	
	responseData: responseData;

	getRespData(){
		return this.responseData;
	}

	setRespData(responseData: data){
		this.responseData = responseData;
	}

	async logOut(pFormData){
		debugger;
		var lUrl = URL + 'logout_app.php'; 
		await fetch(lUrl, {
  			method: 'POST',
		  	headers: HEADER,
			body: pFormData,
		})
		.then((response) => response.json())
    	.then((responseJson) => {
    		console.log(JSON.stringify(responseJson));
    		this.setRespData(responseJson);
    	})
    	.catch((error) => {
      		console.error(error);
    	});
	};

	async studentLogin(pFormData){
		 ;
		var lUrl = URL + 'student_login.php'; 
		await fetch(lUrl, {
  			method: 'POST',
		  	headers: HEADER,
			body: pFormData,
		})
		.then((response) => response.json())
    	.then((responseJson) => {
    		this.setRespData(responseJson);
    	})
    	.catch((error) => {
      		console.error(error);
    	});
	};

	async getDocuments(pFormData){
		 ;
		var lUrl = URL + 'student_certificate.php'; 
		await fetch(lUrl, {
  			method: 'POST',
		  	headers: HEADER,
			body: pFormData,
		})
		.then((response) => response.json())
    	.then((responseJson) => {
    		console.log(JSON.stringify(responseJson));
    		this.setRespData(responseJson);
    	})
    	.catch((error) => {
      		console.error(error);
      		// this.setRespData({'Error':'Service API failure','Message': error});
    	});
	};

}

export default StudentService;