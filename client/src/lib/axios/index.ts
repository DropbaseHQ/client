import Axios from 'axios';

export const axios = Axios.create({
	baseURL: import.meta.env.VITE_API_ENDPOINT,
	headers: {
		Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
	},
});

export const workerAxios = Axios.create({
	baseURL: `${import.meta.env.VITE_WORKER_API_ENDPOINT}`,
	withCredentials: true,
});

export const setAxiosToken = (token: string | null) => {
	axios.defaults.headers.Authorization = token ? `Bearer ${token}` : null;
};

export const setWorkerAxiosToken = (token: string | null) => {
	workerAxios.defaults.headers['access-token'] = token;
};
export const setWorkerAxiosBaseURL = (url: string) => {
	workerAxios.defaults.baseURL = url;
};
export const setWorkerAxiosWorkspaceIdHeader = (workspaceId: string) => {
	workerAxios.defaults.headers['workspace-id'] = workspaceId;
};

axios.interceptors.response.use(
	(res) => {
		return res;
	},
	async (err) => {
		const apiConfig = err.config;

		if (
			apiConfig.url !== '/login' &&
			apiConfig.url !== '/user/register' &&
			apiConfig.url !== '/user/refresh' &&
			err.response
		) {
			// Access Token was expired
			if (
				err.response.status === 401 &&
				!apiConfig.retry &&
				localStorage.getItem('refresh_token')
			) {
				apiConfig.retry = true;

				try {
					const refreshResponse = await axios.post('/user/refresh', undefined, {
						headers: {
							Authorization: `Bearer ${localStorage.getItem('refresh_token')}`,
						},
					});
					const accessToken = refreshResponse?.data?.access_token;
					localStorage.setItem('access_token', accessToken);
					setAxiosToken(accessToken);
					setWorkerAxiosToken(accessToken);

					return await axios(apiConfig);
				} catch (_error) {
					if (
						!(
							window.location.pathname.includes('/login') ||
							window.location.pathname.includes('/register') ||
							window.location.pathname.includes('/email-confirmation') ||
							window.location.pathname.includes('/forgot') ||
							window.location.pathname.includes('/reset')
						)
					) {
						window.location.href = '/login';
					}
				}
			}
			// if (err.response.status === 500) {
			// 	window.location.href = '/login';
			// }
		}

		return Promise.reject(err);
	},
);

workerAxios.interceptors.response.use(
	(res) => {
		return res;
	},
	async (err) => {
		const apiConfig = err.config;
		if (err.response.status === 401 && !apiConfig.retry) {
			apiConfig.retry = true;

			return axios(apiConfig);
		}
		return Promise.reject(err);
	},
);
