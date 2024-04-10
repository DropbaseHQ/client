import Axios from 'axios';
import { getWorkerURL } from '@/utils/url';

export const axios = Axios.create({
	baseURL: import.meta.env.VITE_API_ENDPOINT,
});

export const workerAxios = Axios.create({
	baseURL: getWorkerURL(),
	withCredentials: true,
});
if (localStorage.getItem('access_token')) {
	axios.defaults.headers.Authorization = `Bearer ${localStorage.getItem('access_token')}`;
	// workerAxios.defaults.headers['access-token'] = localStorage.getItem('access_token');
}
export const setAxiosToken = (token: string | null) => {
	axios.defaults.headers.Authorization = token ? `Bearer ${token}` : null;
};

export const setWorkerAxiosToken = () => {
	// workerAxios.defaults.headers['access-token'] = token;
};
export const setWorkerAxiosBaseURL = (url: string) => {
	workerAxios.defaults.baseURL = url;
};

export const setWorkerAxiosWorkspaceIdHeader = () => {
	// workerAxios.defaults.headers['workspace-id'] = workspaceId;
};

axios.interceptors.response.use(
	(res) => {
		return res;
	},
	async (err) => {
		// if (
		// 	apiConfig.url !== '/login' &&
		// 	apiConfig.url !== '/user/register' &&
		// 	apiConfig.url !== '/user/refresh' &&
		// 	err.response
		// ) {
		// 	if (err.response.status === 401) {
		// 		const savedRefreshToken = localStorage.getItem('refresh_token');

		// 		if (savedRefreshToken) {
		// 			// Access Token was expired & refresh token present in local storage
		// 			if (!apiConfig.retry) {
		// 				apiConfig.retry = true;

		// 				try {
		// 					const refreshResponse = await axios.post('/user/refresh', undefined, {
		// 						headers: {
		// 							Authorization: `Bearer ${savedRefreshToken}`,
		// 						},
		// 					});
		// 					const accessToken = refreshResponse?.data?.access_token;
		// 					localStorage.setItem('access_token', accessToken);
		// 					setAxiosToken(accessToken);
		// 					setWorkerAxiosToken(accessToken);

		// 					return await axios(apiConfig);
		// 				} catch (_error) {
		// 					// redirectToLogin();
		// 				}
		// 			}
		// 		} else {
		// 			// redirectToLogin();
		// 		}
		// 	}
		// }

		return Promise.reject(err);
	},
);

// workerAxios.interceptors.response.use(
// 	(res) => {
// 		return res;
// 	},
// 	async (err) => {
// 		const apiConfig = err.config;
// 		if (err.response?.status === 401 && !apiConfig.retry) {
// 			apiConfig.retry = true;

// 			return axios(apiConfig);
// 		}
// 		return Promise.reject(err);
// 	},
// );
