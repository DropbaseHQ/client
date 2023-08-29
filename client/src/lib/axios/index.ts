import Axios from 'axios';

export const axios = Axios.create({
	baseURL: import.meta.env.VITE_API_ENDPOINT,
	withCredentials: true,
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
			apiConfig.url !== '/refresh' &&
			err.response
		) {
			// Access Token was expired
			if (err.response.status === 401 && !apiConfig.retry) {
				apiConfig.retry = true;

				try {
					await axios.post('/refresh');

					return await axios(apiConfig);
				} catch (_error) {
					window.location.href = '/login';
				}
			}
		}

		return Promise.reject(err);
	},
);
