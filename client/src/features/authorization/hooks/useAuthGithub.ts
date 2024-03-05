import { useQuery } from 'react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';

import { axios } from '@/lib/axios';
import { onboardingAtom } from '@/features/authorization';

export type GithubAuthResponse = {
	access_token: string;
	refresh_token: string;
};
const authorizeGithub = async (code: string) => {
	const response = await axios.get<GithubAuthResponse>(`/user/github_auth/${code}`);

	return response.data;
};

export const useAuthorizeGithub = () => {
	const toast = useToast();
	const { search } = useLocation();
	const params = new URLSearchParams(search);
	const code = params.get('code');
	const updateOnboardingStatus = useSetAtom(onboardingAtom);

	const navigate = useNavigate();
	return useQuery(['github_auth', code], () => authorizeGithub(code || ''), {
		enabled: !!code,

		onSuccess: (data: any) => {
			if (data?.access_token && data?.refresh_token) {
				localStorage.setItem('access_token', data.access_token);
				localStorage.setItem('refresh_token', data.refresh_token);
				updateOnboardingStatus(data?.onboarding || false);
				navigate('/apps');
			}
		},
		onError: (error) => {
			toast({
				title: 'Github Auth Failed',
				status: 'error',
				description: getErrorMessage(error),
			});
			navigate('/login');
		},
	});
};
