import { useQuery } from 'react-query';
import { useMemo } from 'react';
import { workerAxios } from '@/lib/axios';

export const ALL_SOURCES_QUERY_KEY = 'sources';

interface Source {
	name: string;
	type: string;
}

const fetchAllSources = async () => {
	const response = await workerAxios.get<{ sources: Source[] }>(`/sources/`);

	return response.data;
};

export const useSources = () => {
	const queryKey = [ALL_SOURCES_QUERY_KEY];

	const { data: response, ...rest } = useQuery(queryKey, () => fetchAllSources());

	const info = useMemo(() => {
		return {
			sources: response?.sources || [],
		};
	}, [response]);

	return {
		...rest,
		queryKey,
		...info,
	};
};
