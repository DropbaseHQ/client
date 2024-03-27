import { useMemo } from 'react';
import { useGetPage } from '@/features/page';

export const APP_STATE_QUERY_KEY = 'appState';

export const useAppState = (appName: string, pageName: string) => {
	const { data: response, ...rest } = useGetPage({
		appName,
		pageName,
		refetchInterval: false,
	});

	const info = useMemo(() => {
		return {
			state: response?.state_context || { context: {}, state: {} },
		};
	}, [response]);

	return {
		...rest,
		...info,
	};
};
