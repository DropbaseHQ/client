import { useQuery } from 'react-query';
import { useMemo } from 'react';

import { axios } from '@/lib/axios';

export const APP_STATE_QUERY_KEY = 'appState';

const fetchAppState = async ({ pageId }: { pageId: string }) => {
	const response = await axios.get<any>(`/page/state/${pageId}`);

	return response.data;
};

export const useAppState = (pageId: string) => {
	const queryKey = [APP_STATE_QUERY_KEY, pageId];

	const { data: response, ...rest } = useQuery(queryKey, () => fetchAppState({ pageId }), {
		enabled: Boolean(pageId),
		refetchInterval: false,
	});

	const info = useMemo(() => {
		return {
			state: response || { context: {}, state: {} },
		};
	}, [response]);

	return {
		...rest,
		queryKey,
		...info,
	};
};
