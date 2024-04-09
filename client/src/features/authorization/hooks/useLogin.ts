import { useMutation } from 'react-query';
import { useEffect, useState } from 'react';
import { useSetAtom } from 'jotai';
import { MutationConfig } from '@/lib/react-query';
import { activeURLMappingAtom } from '@/features/settings/atoms';
import { axios, setWorkerAxiosBaseURL } from '@/lib/axios';
import { getWorkerURL, getWebSocketURL, getLSPURL } from '@/utils/url';
import { URLMapping, useURLMappings } from '@/features/settings/hooks/urlMappings';

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
	// useEffect(() => {
	// 	const fetchData = async () => {
	// 		if (loginRoutes) return;
	// 		if (localStorage.getItem('access_token')) {
	// 			const savedAccessToken = localStorage.getItem('access_token');
	// 			setWorkerAxiosToken(savedAccessToken);
	// 			setAxiosToken(savedAccessToken);
	// 		} else {
	// 			try {
	// 				const response = await axios.post('/user/refresh');
	// 				const accessToken = response.data.access_token;
	// 				localStorage.setItem('access_token', accessToken);
	// 				setWorkerAxiosToken(accessToken);
	// 				setAxiosToken(accessToken);
	// 			} catch (error) {
	// 				navigate('/login');
	// 			}
	// 		}
	// 	};
	// 	fetchData();
	// 	setWorkerAxiosWorkspaceIdHeader(workspaceId || '');
	// }, [navigate, workspaceId, loginRoutes]);
};

const urlMatcher = (mapping: URLMapping) =>
	!!mapping?.client_url && window.location.href.includes(mapping.client_url);

export const useSetWorkerAxiosBaseURL = () => {
	// Track whether the URL was set successfully or not
	const [urlSet, setWorkerURL] = useState(false);
	const { urlMappings, isLoading, isFetched } = useURLMappings();

	const setActiveMapping = useSetAtom(activeURLMappingAtom);
	const matchingURL = urlMappings.find(urlMatcher);
	const getHTTP = () => {
		if (window.location.protocol === 'https:') {
			return 'https';
		}
		return 'http';
	};

	useEffect(() => {
		if (!isLoading && isFetched) {
			if (matchingURL) {
				setWorkerAxiosBaseURL(`${getHTTP()}://${matchingURL.worker_url}`);
				setActiveMapping(matchingURL);
			} else {
				setWorkerAxiosBaseURL(getWorkerURL());
			}
			setWorkerURL(true);
		}
	}, [matchingURL, isLoading, setActiveMapping, urlMappings, isFetched]);

	return {
		urlSet,
		isLoading,
		isFetched,
	};
};

const getWS = () => {
	if (window.location.protocol === 'https:') {
		return 'wss';
	}
	return 'ws';
};

export const useGetWebSocketURL = () => {
	const { urlMappings } = useURLMappings();
	const setActiveMapping = useSetAtom(activeURLMappingAtom);

	const matchingURL = urlMappings.find(urlMatcher);

	if (matchingURL) {
		setActiveMapping(matchingURL);
		return `${getWS()}://${matchingURL.worker_url}/ws`;
	}

	return getWebSocketURL();
};

export const useGetLSPURL = () => {
	const { urlMappings } = useURLMappings();
	const setActiveMapping = useSetAtom(activeURLMappingAtom);

	const matchingURL = urlMappings.find(urlMatcher);

	if (matchingURL) {
		setActiveMapping(matchingURL);
		return `${getWS()}://${matchingURL.lsp_url}/lsp`;
	}

	return getLSPURL();
};
