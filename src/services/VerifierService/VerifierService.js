
import { URL, HEADER } from '../../App';

class VerifierService {

	responseData: responseData;

	getRespData() {
		return this.responseData;
	}

	setRespData(responseData: data) {
		this.responseData = responseData;
	}

	async scanByPublicUser(pFormData, token) {
		HEADER.accesstoken = token
		var lUrl = URL + 'scan';

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

	async makePayment(pFormData) {
		//debugger;
		var lUrl = URL + 'getpayment_instamojo.php';
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

	async getpaymentStatus(trans_id) {
		//	debugger;
		var lUrl = "https://test.instamojo.com/api/1.1/payment-requests/" + trans_id;
		await fetch(lUrl, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'X-Api-Key': 'test_e2ddee69d588d561b9f83f5e664',	//edca9294ebac6f771db43e94f7016cb3
				'X-Auth-Token': 'test_11b8fbd6c5adbf17bc548672177'	// 5f2efba7d0e687ccc7f2b84f0209432d
			}
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

export default VerifierService;
