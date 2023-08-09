import { ApiService } from '@src/api/ApiService';
import { getURLParams } from '@src/helpers/URLHelper';
import { clearUserSession } from '@src/helpers/ApiHelper';
import { AxiosError, AxiosResponse } from 'axios';
import { storeToken } from '@src/helpers/StorageHelper';

const useIdToken = () => {
	const handle = (apiService: ApiService, onComplete?: () => void) => {
		const idToken = getURLParams().get('idt');
		if (idToken) {
			// Clear existing user session
			clearUserSession(undefined, undefined, undefined);

			// Converting id token
			apiService.convertIdTokenCall(
				idToken,
				(response: AxiosResponse) => {
					// Store token in local storage
					storeToken(response.data.token);
				},
				(error: AxiosError) => {
					const reason = error.response?.data?.reason ?? '';
					window.history.pushState(
						undefined,
						'',
						'/id_token_error?reason=' + reason
					);
				},
				() => {
					onComplete?.();
				}
			);
		} else {
			onComplete?.();
		}
	};

	return {
		handle,
	};
};

export default useIdToken;
