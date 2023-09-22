import { useMemo } from 'react';
import { useQuery } from 'react-query';

import { axios } from '@/lib/axios';

export const APP_QUERY_KEY = 'page';

const fetchPageInfo = async ({ pageId }: { pageId: string }) => {
	const response = await axios.get<{
		page: { workspace_id: string; name: string; id: string };
		action: { id: string; name: string };
		sql: { id: string; code: string }[];
		functions: {
			fetchers: { id: string; code: string; type: string; date: string }[];
			ui_components: { id: string; code: string; type: string; date: string }[];
		};
	}>(`/page/${pageId}`);

	return response.data;
};

export const useGetPage = (pageId: string) => {
	const queryKey = [APP_QUERY_KEY, pageId];

	const { data: response, ...rest } = useQuery(queryKey, () => fetchPageInfo({ pageId }), {
		enabled: Boolean(pageId),
	});

	const pageInfo: any = useMemo(() => {
		if (response) {
			return {
				page: response?.page,
				action: response?.action,
				sql: response?.sql?.[0],
				functions: response?.functions,
				fetchers: response?.functions?.fetchers,
				uiComponents: response?.functions?.ui_components,
			};
		}

		return {
			page: {},
			sql: {},
			action: {},
			fetchers: [],
			uiComponents: [],
		};
	}, [response]);

	return {
		...rest,
		queryKey,
		...pageInfo,
	};
};
