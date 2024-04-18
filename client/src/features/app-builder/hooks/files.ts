import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { workerAxios } from '@/lib/axios';

import { PAGE_DATA_QUERY_KEY } from '@/features/page';
import { ALL_PAGE_FUNCTIONS_NAMES_QUERY_KEY } from './functions';
import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';
import { DATA_FETCHER_QUERY_KEY } from '@/features/app-builder/hooks';

export const ALL_PAGE_FILES_QUERY_KEY = 'allFiles';
export const ALL_FUNCTIONS_QUERY_KEY = 'allFunctions';

const fetchStateContextFunctions = async ({
	pageName,
	appName,
}: {
	pageName: any;
	appName: any;
}) => {
	const response = await workerAxios.get<any>(`/files/get_functions/${appName}/${pageName}/`);
	return response.data;
};

export const useFunctions = ({ pageName, appName }: { pageName: any; appName: any }) => {
	const queryKey = [ALL_FUNCTIONS_QUERY_KEY, pageName, appName];

	const { data: response, ...rest } = useQuery(
		queryKey,
		() => fetchStateContextFunctions({ pageName, appName }),
		{
			enabled: Boolean(appName) && Boolean(pageName),
			staleTime: Infinity,
			cacheTime: Infinity,
		},
	);

	const info = useMemo(() => {
		return {
			functions: response || [],
		};
	}, [response]);

	return {
		...rest,
		queryKey,
		...info,
	};
};

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

const createFile = async ({ pageName, fileName, appName, pageId, type }: any) => {
	const response = await workerAxios.post(`/files/`, {
		name: fileName,
		page_id: pageId,
		app_name: appName,
		page_name: pageName,
		type,
		source: null,
		depends_on: [],
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
			queryClient.invalidateQueries(DATA_FETCHER_QUERY_KEY);
			queryClient.invalidateQueries(ALL_PAGE_FUNCTIONS_NAMES_QUERY_KEY);
		},
	});
};

const deleteFile = async ({ pageName, fileType, fileName, appName }: any) => {
	const response = await workerAxios.delete(`/files/`, {
		data: {
			app_name: appName,
			page_name: pageName,
			file_name: fileName,
			type: fileType,
		},
	});
	return response.data;
};

export const useDeleteFile = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(deleteFile, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(ALL_PAGE_FILES_QUERY_KEY);
			queryClient.refetchQueries(PAGE_DATA_QUERY_KEY);
			queryClient.invalidateQueries(DATA_FETCHER_QUERY_KEY);
		},
	});
};

const updateFile = async ({ pageName, pageId, fileName, fileType, appName, newFileName }: any) => {
	const response = await workerAxios.put(`/files/rename`, {
		app_name: appName,
		page_name: pageName,
		old_name: fileName,
		new_name: newFileName,
		type: fileType,
		page_id: pageId,
	});
	return response.data;
};

export const useUpdateFile = (props: any = {}) => {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation(updateFile, {
		...props,
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to update function',
				description: getErrorMessage(error),
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries(ALL_PAGE_FILES_QUERY_KEY);
			queryClient.refetchQueries(PAGE_DATA_QUERY_KEY);
			queryClient.invalidateQueries(DATA_FETCHER_QUERY_KEY);
			queryClient.invalidateQueries(ALL_PAGE_FUNCTIONS_NAMES_QUERY_KEY);
		},
	});
};
