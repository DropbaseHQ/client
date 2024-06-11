import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { workerAxios } from '@/lib/axios';

export const ALL_PAGE_FILES_QUERY_KEY = 'allFiles';
export const ALL_FUNCTIONS_QUERY_KEY = 'allFunctions';

const fetchFile = async ({ fileName, appName, pageName }: any) => {
	const response = await workerAxios.get<string>(
		`/workspace/${appName}/${pageName}/${fileName}/`,
	);

	return response.data;
};

export const PAGE_FILE_QUERY_KEY = 'file';

export const useFile = ({ fileName, appName, pageName }: any) => {
	const queryKey = [PAGE_FILE_QUERY_KEY, fileName, appName, pageName];

	const { data: response, ...rest } = useQuery(
		queryKey,
		() => fetchFile({ fileName, appName, pageName }),
		{
			enabled: Boolean(fileName && appName && pageName),
			cacheTime: 0,
			staleTime: 0,
		},
	);

	const info = useMemo(() => {
		return {
			code: response || '',
		};
	}, [response]);

	return {
		...rest,
		queryKey,
		...info,
	};
};
