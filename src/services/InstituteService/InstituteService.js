
import { URL, HEADER } from '../../App';

class InstituteService {

	responseData: responseData;

	getRespData() {
		return this.responseData;
	}

	setRespData(responseData: data) {
		this.responseData = responseData;
	}

	async instituteLogin(pFormData) {
		;
		var lUrl = URL + 'institute_login_arr.php';
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

	async instituteScanViewCertificate(pFormData, token) {
		console.log(token);

		HEADER.accesstoken = token
		var lUrl = URL + 'nidan/scan-certificate';

		console.log("lUrl" + lUrl);
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

	async instituteScan1DCertificate(pFormData, token) {
		HEADER.accesstoken = token
		var lUrl = URL + 'scan-audit-trail';
		// var lUrl = URL + 'scan_view_audit_trail.php';
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

export default InstituteService;