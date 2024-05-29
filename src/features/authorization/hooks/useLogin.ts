import { useMutation } from 'react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { MutationConfig } from '@/lib/react-query';
import { workspaceAtom } from '@/features/workspaces';
import { workerAxios, setWorkerAxiosWorkspaceIdHeader, setWorkerAxiosToken } from '@/lib/axios';
import { getWebSocketURL, getLSPURL } from '@/utils/url';

export type LoginResponse = {
	user: any;
	workspace: any;
	access_token?: string;
	refresh_token?: string;
};
const loginUser = async ({ email, password }: { email: string; password: string }) => {
	const response = await workerAxios.post<LoginResponse>(`/user/login`, {
		email,
		password,
	});

	return response.data;
};

const loginGoogleUser = async ({ credential }: { credential: string }) => {
	const response = await workerAxios.post<LoginResponse>(`/user/loginGoogle`, {
		credential,
	});

	return response.data;
};

export const useLogin = (mutationConfig: MutationConfig<typeof loginUser>) => {
	return useMutation(loginUser, {
		...(mutationConfig || {}),
	});
};

export const useGoogleLogin = (mutationConfig: MutationConfig<typeof loginGoogleUser>) => {
	return useMutation(loginGoogleUser, {
		...(mutationConfig || {}),
	});
};

export const useSetAxiosToken = () => {
	const navigate = useNavigate();
	const selectedWorkspace = useAtomValue(workspaceAtom);
	const workspaceId = selectedWorkspace?.id;
	const { pathname } = useLocation();

	const loginRoutes =
		pathname.startsWith('/login') ||
		pathname.startsWith('/register') ||
		pathname.startsWith('/reset') ||
		pathname.startsWith('/email-confirmation') ||
		pathname.startsWith('/forgot') ||
		pathname.startsWith('/github_auth');

	useEffect(() => {
		const fetchData = async () => {
			if (loginRoutes) return;

			if (localStorage.getItem('access_token')) {
				const savedAccessToken = localStorage.getItem('access_token');
				setWorkerAxiosToken(savedAccessToken);
			} else {
				try {
					const response = await workerAxios.post('/user/refresh', undefined, {
						headers: {
							Authorization: `Bearer ${localStorage.getItem('refresh_token')}`,
						},
					});
					const accessToken = response.data.access_token;
					localStorage.setItem('access_token', accessToken);
					setWorkerAxiosToken(accessToken);
				} catch (error) {
					navigate('/login');
				}
			}
		};

		fetchData();
		setWorkerAxiosWorkspaceIdHeader(workspaceId || '');
	}, [navigate, workspaceId, loginRoutes]);
};

export const useGetWebSocketURL = () => {
	// const { urlMappings } = useURLMappings();
	// const setActiveMapping = useSetAtom(activeURLMappingAtom);

	// const matchingURL = urlMappings.find(urlMatcher);

	// if (matchingURL) {
	// 	setActiveMapping(matchingURL);
	// 	return `${getWS()}://${matchingURL.worker_url}/ws`;
	// }

	return getWebSocketURL();
};

export const useGetLSPURL = () => {
	return getLSPURL();
};
