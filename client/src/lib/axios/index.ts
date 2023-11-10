import Axios from 'axios';

export const axios = Axios.create({
	baseURL: import.meta.env.VITE_API_ENDPOINT,
	withCredentials: true,
});

export const workerAxios = Axios.create({
	baseURL: `${import.meta.env.VITE_WORKER_API_ENDPOINT}/worker`,
});

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
			if (err.response.status === 401 && !apiConfig.retry) {
				apiConfig.retry = true;

				try {
					await axios.post('/user/refresh');

					return await axios(apiConfig);
				} catch (_error) {
					if (
						!(
							window.location.pathname.includes('/login') ||
							window.location.pathname.includes('/register')
						)
					) {
						window.location.href = '/login';
					}
				}
			}
		}

		return Promise.reject(err);
	},
);
