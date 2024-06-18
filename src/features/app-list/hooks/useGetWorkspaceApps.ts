import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { workerAxios } from '@/lib/axios';

const fetchWorkspaceApps = async () => {
	const { data } = await workerAxios.get<any>(`/workspaces/`);
	return data;
};

export const APPS_QUERY_KEY = 'workspaceApps';

export const useGetWorkspaceApps = (props?: any) => {
	const queryKey = [APPS_QUERY_KEY];
	const { data: response, ...rest } = useQuery(queryKey, () => fetchWorkspaceApps(), {
		staleTime: 1000 * 60 * 5,
		...(props || {}),
	});

	const data = useMemo(() => {
		return {
			apps: Object.keys(response?.apps || {}).map((appKey) => ({
				name: appKey,
				...(response?.apps?.[appKey] || {}),
			})),
			owner: response?.owner,
		};
	}, [response]);

	return {
		...rest,
		...data,
	};
};
