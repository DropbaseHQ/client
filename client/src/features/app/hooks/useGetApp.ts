import { useMemo } from 'react';
import { useQuery } from 'react-query';

import { axios } from '@/lib/axios';

export const APP_QUERY_KEY = 'app';

const fetchAppInfo = async ({ appId }: { appId: string }) => {
	const response = await axios.get<{
		app: { workspace_id: string; name: string; id: string };
		sql: { id: string; code: string }[];
		functions: {
			fetchers: { id: string; code: string; type: string; date: string }[];
			ui_components: { id: string; code: string; type: string; date: string }[];
		};
	}>(`/app/${appId}`);

	return response.data;
};

export const useGetApp = (appId: string) => {
	const queryKey = [APP_QUERY_KEY, appId];

	const { data: response, ...rest } = useQuery(queryKey, () => fetchAppInfo({ appId }), {
		enabled: Boolean(appId),
	});

	const appInfo: any = useMemo(() => {
		if (response) {
			return {
				app: response?.app,
				sql: response?.sql[0],
				functions: response?.functions,
				fetchers: response?.functions?.fetchers,
				uiComponents: response?.functions?.ui_components,
			};
		}

		return {
			app: {},
			sql: {},
			fetchers: [],
			uiComponents: [],
		};
	}, [response]);

	return {
		...rest,
		queryKey,
		...appInfo,
	};
};
