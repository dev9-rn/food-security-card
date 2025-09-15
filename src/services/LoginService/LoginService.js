
import { URL, HEADER } from '../../App';

class LoginService {

	responseData: responseData;

	getRespData() {
		return this.responseData;
	}

	setRespData(responseData: data) {
		this.responseData = responseData;
	}

	async logOut(pFormData) {
		HEADER.accesstoken = pFormData;
		console.log(HEADER);

		var lUrl = URL + 'logout';
		await fetch(lUrl, {
			method: 'POST',
			headers: {
				// 'Content-Type': 'multipart\/form-data',
				// 'Accept': 'application/json',
				'apikey': HEADER.apikey,
				'accesstoken': HEADER.accesstoken,
			},
			// body: pFormData,
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

	async doLogin(pFormData) {
		console.log(HEADER);

		// var lUrl = URL + 'login_arr.php';
		var lUrl = URL + 'user-login';
		console.log(lUrl);
		
		await fetch(lUrl, {
			method: 'POST',
			headers: HEADER,
			body: pFormData,
		})
			.then((response) => response.json())
			.then((responseJson) => {
				console.log(JSON.stringify(responseJson));
				this.setRespData(responseJson);
				// return responseJson;
			})
			.catch((error) => {
				console.error(error);
			});
	};

	async instituteLogin(pFormData) {
		var lUrl = URL + 'institute-login';
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
	async resendOtpVerify(pFormData) {
		var lUrl = URL + 'resend-otp';
		console.log(lUrl);
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
	async otpVerify(pFormData) {
		console.log(pFormData);

		var lUrl = URL + 'mobile-no-verify';
		console.log(lUrl);
		await fetch(lUrl, {
			method: 'POST',
			headers: HEADER,
			body: pFormData,
		})
			.then(res => {
				res.json().then(responseJson => {
					console.log(res.headers.map);
					console.log(responseJson);

					responseJson.data.access_token = res.headers.map.accesstoken;
					console.log("lallu");
					console.log(responseJson);

					// let token = res.headers.map.accesstoken;
					this.setRespData(responseJson);
				})
			})
			// .then((response) => response.json())
			// .then((responseJson) => {
			// 	console.log(JSON.stringify(responseJson));
			// 	this.setRespData(responseJson);
			// })
			.catch((error) => {
				console.error(error);
			});
	};
	async registration(pFormData) {
		var lUrl = URL + 'user-register';
		console.log(lUrl);
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
}

export default LoginService;