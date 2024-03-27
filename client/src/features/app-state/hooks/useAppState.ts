import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/lib/chakra-ui';
import { useGetPage } from '@/features/page';

export const APP_STATE_QUERY_KEY = 'appState';

export const useAppState = (appName: string, pageName: string) => {
	const toast = useToast();
	const navigate = useNavigate();

	const { data: response, ...rest } = useGetPage({
		appName,
		pageName,
		refetchInterval: false,
	});
	if (rest?.error) {
		const errorStatusCode = (rest.error as any)?.response?.status;
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
		...info,
	};
};
