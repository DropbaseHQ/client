import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useMemo } from 'react';

import { workerAxios } from '@/lib/axios';
import { WIDGET_PREVIEW_QUERY_KEY } from '@/features/new-app-preview/hooks';

export const ALL_PAGE_FUNCTIONS_NAMES_QUERY_KEY = 'functionNames';

const fetchAllPageFunctionNames = async ({ appName, pageName }: any) => {
	const response = await workerAxios.get<any>(`files/functions/${appName}/${pageName}/context/`);

	return response.data;
};

export const useAllPageFunctionNames = ({ appName, pageName }: any) => {
	const queryKey = [ALL_PAGE_FUNCTIONS_NAMES_QUERY_KEY, appName, pageName];

	const { data: response, ...rest } = useQuery(
		queryKey,
		() => fetchAllPageFunctionNames({ appName, pageName }),
		{
			enabled: Boolean(pageName && appName),
		},
	);

	const info = useMemo(() => {
		return {
			functions: response?.files || [],
		};
	}, [response]);

	return {
		...rest,
		queryKey,
		...info,
	};
};

const runPythonFunction = async ({ pageName, appName, code, pageState }: any) => {
	const response = await workerAxios.post(`query/run_python_string/`, {
		page_name: pageName,
		app_name: appName,
		payload: pageState,
		python_string: code,
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
