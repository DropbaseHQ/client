import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useMemo } from 'react';

import { axios, workerAxios } from '@/lib/axios';
import { WIDGET_PREVIEW_QUERY_KEY } from '@/features/app-preview/hooks';

export const ALL_PAGE_FUNCTIONS_NAMES_QUERY_KEY = 'functionNames';

const fetchAllPageFunctionNames = async ({ pageId }: any) => {
	const response = await axios.get<any>(`/files/ui_functions/${pageId}/`);
	return response;
};

export const useAllPageFunctionNames = ({ pageId }: any) => {
	const queryKey = [ALL_PAGE_FUNCTIONS_NAMES_QUERY_KEY, pageId];

	const { data: response, ...rest } = useQuery(
		queryKey,
		() => fetchAllPageFunctionNames({ pageId }),
		{
			enabled: Boolean(pageId),
			cacheTime: 0,
			staleTime: 9,
			refetchInterval: 30 * 1000,
		},
	);

	const info = useMemo(() => {
		return {
			functions: response?.data.map((o: any) => o.name) || [],
		};
	}, [response]);

	return {
		...rest,
		queryKey,
		...info,
	};
};

const runPythonFunction = async ({ pageName, appName, code, pageState, file }: any) => {
	const response = await workerAxios.post(`run_python/run_python_string/`, {
		page_name: pageName,
		app_name: appName,
		payload: pageState,
		python_string: code,
		file,
	});

	return response.data;
};

export const useRunFunction = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(runPythonFunction, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(WIDGET_PREVIEW_QUERY_KEY);
			queryClient.invalidateQueries(ALL_PAGE_FUNCTIONS_NAMES_QUERY_KEY);
		},
	});
};
