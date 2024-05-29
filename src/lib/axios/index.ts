import Axios from 'axios';
import { getWorkerURL } from '@/utils/url';
import { isFreeApp } from '@/utils';

export const workerAxios = Axios.create({
	baseURL: getWorkerURL(),
	withCredentials: true,
});

if (localStorage.getItem('access_token')) {
	workerAxios.defaults.headers.Authorization = `Bearer ${localStorage.getItem('access_token')}`;

	// if (!isFreeApp()) {
	// 	workerAxios.defaults.headers.Authorization = `Bearer ${localStorage.getItem(
	// 		'access_token',
	// 	)}`;
	// }
}

export const setWorkerAxiosToken = (token: string | null) => {
	workerAxios.defaults.headers.Authorization = token ? `Bearer ${token}` : null;
};

export const setWorkerAxiosBaseURL = (url: string) => {
	workerAxios.defaults.baseURL = url;
};

// export const setWorkerAxiosToken = (token: string | null) => {
// 	workerAxios.defaults.headers['access-token'] = token;
// };

const redirectToLogin = () => {
	if (
		!(
			window.location.pathname.includes('/login') ||
			window.location.pathname.includes('/register') ||
			window.location.pathname.includes('/email-confirmation') ||
			window.location.pathname.includes('/forgot') ||
			window.location.pathname.includes('/reset') ||
			window.location.pathname.includes('/github_auth')
		)
	) {
		window.location.href = '/login';
	}
};

if (!isFreeApp()) {
	workerAxios.interceptors.response.use(
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
				if (err.response.status === 401) {
					const savedRefreshToken = localStorage.getItem('refresh_token');

					if (savedRefreshToken) {
						// Access Token was expired & refresh token present in local storage
						if (!apiConfig.retry) {
							apiConfig.retry = true;

							try {
								const refreshResponse = await workerAxios.post(
									'/user/refresh',
									undefined,
									{
										headers: {
											Authorization: `Bearer ${savedRefreshToken}`,
										},
									},
								);
								const accessToken = refreshResponse?.data?.access_token;
								localStorage.setItem('access_token', accessToken);
								setWorkerAxiosToken(accessToken);

								return await workerAxios(apiConfig);
							} catch (_error) {
								redirectToLogin();
							}
						}
					} else {
						redirectToLogin();
					}
				}
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

				return workerAxios(apiConfig);
			}
			return Promise.reject(err);
		},
	);
}
