import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { workerAxios } from '@/lib/axios';

import { PAGE_DATA_QUERY_KEY } from '@/features/page';
import { ALL_PAGE_FUNCTIONS_NAMES_QUERY_KEY } from './functions';

export const ALL_PAGE_FILES_QUERY_KEY = 'allFiles';

const fetchAllPageFiles = async ({ pageName, appName }: { pageName: string; appName: string }) => {
	const response = await workerAxios.get<{ files: string[] }>(
		`/files/all/${appName}/${pageName}/`,
	);

	return response.data;
};

export const usePageFiles = ({ pageName, appName }: { pageName: string; appName: string }) => {
	const queryKey = [ALL_PAGE_FILES_QUERY_KEY, pageName, appName];

	const { data: response, ...rest } = useQuery(
		queryKey,
		() => fetchAllPageFiles({ pageName, appName }),
		{
			enabled: Boolean(appName) && Boolean(pageName),
		},
	);

	const info = useMemo(() => {
		return {
			files: response?.files || [],
		};
	}, [response]);

	return {
		...rest,
		queryKey,
		...info,
	};
};

const fetchFile = async ({ fileName, appName, pageName }: any) => {
	const response = await workerAxios.get<string>(
		`/workspace/${appName}/${pageName}/scripts/${fileName}/`,
	);

	return response.data;
};

const PAGE_FILE_QUERY_KEY = 'file';

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

const createFile = async ({ pageName, fileName, appName, pageId, type, source }: any) => {
	const response = await workerAxios.post(`/files/create/`, {
		name: fileName,
		page_id: pageId,
		app_name: appName,
		page_name: pageName,
		type,
		source,
	});

	return response.data;
};

export const useCreateFile = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(createFile, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(ALL_PAGE_FILES_QUERY_KEY);
			queryClient.invalidateQueries(PAGE_DATA_QUERY_KEY);
			queryClient.invalidateQueries(ALL_PAGE_FUNCTIONS_NAMES_QUERY_KEY);
		},
	});
};
