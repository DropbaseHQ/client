import { useMutation } from 'react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { MutationConfig } from '@/lib/react-query';
import { workspaceAtom } from '@/features/workspaces';
import {
	axios,
	setWorkerAxiosWorkspaceIdHeader,
	setWorkerAxiosToken,
	setWorkerAxiosBaseURL,
	setAxiosToken,
} from '@/lib/axios';
import { getWorkerURL } from '@/utils/url';
import { useURLMappings } from '@/features/settings/hooks/urlMappings';

export type LoginResponse = {
	user: any;
	workspace: any;
	access_token?: string;
	refresh_token?: string;
};
const loginUser = async ({ email, password }: { email: string; password: string }) => {
	const response = await axios.post<LoginResponse>(`/user/login`, {
		email,
		password,
	});

	return response.data;
};

const loginGoogleUser = async ({ credential }: { credential: string }) => {
	const response = await axios.post<LoginResponse>(`/user/loginGoogle`, {
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
	const { id: workspaceId } = useAtomValue(workspaceAtom);
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
				setAxiosToken(savedAccessToken);
			} else {
				try {
					const response = await axios.post('/user/refresh');
					const accessToken = response.data.access_token;
					localStorage.setItem('access_token', accessToken);
					setWorkerAxiosToken(accessToken);
					setAxiosToken(accessToken);
				} catch (error) {
					navigate('/login');
				}
			}
		};

		fetchData();
		setWorkerAxiosWorkspaceIdHeader(workspaceId || '');
	}, [navigate, workspaceId, loginRoutes]);
};
export const useSetWorkerAxiosBaseURL = () => {
	const [workspace] = useAtom(workspaceAtom);
	const workspaceId = workspace?.id;
	const { urlMappings } = useURLMappings();

	const matchingURL = urlMappings.find((mapping) =>
		window.location.href.includes(mapping.client_url),
	);
	useEffect(() => {
		if (matchingURL) {
			console.log('in here');
			setWorkerAxiosBaseURL(`http://${matchingURL.worker_url}`);
		} else {
			setWorkerAxiosBaseURL(getWorkerURL());
		}
	}, [workspaceId, matchingURL]);
};
