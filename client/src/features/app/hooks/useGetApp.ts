import { useQuery } from 'react-query';

import { axios } from '@/lib/axios';

export const APP_QUERY_KEY = 'app';

const fetchAppInfo = async ({ appId }: { appId: string }) => {
	const response = await axios.get<{
		workspace_id: string;
		name: string;
		id: string;
	}>(`/app/${appId}`);

	return response.data;
};

export const useGetApp = (appId: string) => {
	const queryKey = [APP_QUERY_KEY, appId];

	const { data: response, ...rest } = useQuery(queryKey, () => fetchAppInfo({ appId }), {
		enabled: Boolean(appId),
	});

	return {
		...rest,
		app: response,
		queryKey,
	};
};
