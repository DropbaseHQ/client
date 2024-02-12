import { useQuery } from 'react-query';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FetchPageResponse } from '@/features/page';
import { workerAxios } from '@/lib/axios';
import { useToast } from '@/lib/chakra-ui';

export const APP_STATE_QUERY_KEY = 'appState';

const fetchAppState = async ({ appName, pageName }: { appName: string; pageName: string }) => {
	const response = await workerAxios.get<FetchPageResponse>(`/page/${appName}/${pageName}`);
	return response.data;
};

export const useAppState = (appName: string, pageName: string) => {
	const queryKey = [APP_STATE_QUERY_KEY, appName, pageName];
	const toast = useToast();
	const navigate = useNavigate();

	const { data: response, ...rest } = useQuery(
		queryKey,
		() => fetchAppState({ appName, pageName }),
		{
			enabled: Boolean(appName && pageName),
			refetchInterval: false,
		},
	);
	if (rest?.error) {
		const errorStatusCode = rest.error?.response?.status;
		if (errorStatusCode === 403) {
			toast.closeAll();
			toast({
				title: 'Unauthorized',
				description: 'You do not have permission to view this page.',
				status: 'error',
			});
			navigate('/apps');
		}
	}
	const info = useMemo(() => {
		return {
			state: response?.state_context || { context: {}, state: {} },
			permissions: response?.permissions,
		};
	}, [response]);

	return {
		...rest,
		queryKey,
		...info,
	};
};
