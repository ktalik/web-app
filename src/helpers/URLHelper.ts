export const isLocalHost = () => {
	return ['localhost', '127.0.0.1', '10.0.2.2'].includes(
		window.location.hostname
	);
};

export const getAdminPanelURL = (apiBaseURL: string) => {
	return apiBaseURL.replace('/api/v1', '/admin');
};
export const getHubURL = (apiBaseURL: string) => {
	return apiBaseURL.replace('/api/v1', '/hub');
};
export const getBaseURL = () => {
	const windowLocation = window.location;
	return windowLocation.protocol + '//' + windowLocation.host + '/';
};
export const getWebSocketURL = (apiBaseURL: string) => {
	if (
		!apiBaseURL ||
		apiBaseURL === '/' ||
		apiBaseURL === '/api/v1/' ||
		apiBaseURL === '/api/v2/'
	) {
		const baseURL = getBaseURL();
		return prepareWebsocketURL(baseURL);
	} else {
		return prepareWebsocketURL(apiBaseURL);
	}
};
const prepareWebsocketURL = (url: string) => {
	return url
		.replace('https://', 'wss://websockets-')
		.replace('http://', 'wss://websockets-')
		.replace('api/v1/', '')
		.replace('api/v2/', '');
};

export const getIntegrationApiBaseURL = () => {
	const urlParams = new URLSearchParams(window.location.search);
	return prepareApiBaseURL(urlParams.get('integration_api_base_url'));
};

export const prepareApiBaseURL = (url: string | null) => {
	if (!url) return;

	if (url.startsWith('http:')) {
		url = url.replace('http:', 'https:');
	}

	if (!url.startsWith('https://')) {
		url = 'https://' + url;
	}

	try {
		const result = new URL(url);
		return result.origin + '/api/v1/';
	} catch (e) {
		console.error(e);
	}
};

export const prepareURLForDisplay = (url: string) => {
	return url
		.replace('http://', '')
		.replace('https://', '')
		.replace('/api/v1/', '')
		.replace('/api/v2/', '');
};
