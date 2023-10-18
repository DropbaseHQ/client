import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useMemo } from 'react';

import { axios, workerAxios } from '@/lib/axios';
import { WIDGET_PREVIEW_QUERY_KEY } from '@/features/new-app-preview/hooks';

export const ALL_PAGE_FUNCTIONS_NAMES_QUERY_KEY = 'functionNames';

const fetchAllPageFunctionNames = async ({ appName, pageName }: any) => {
	const response = await workerAxios.get<any>(`files/functions/${appName}/${pageName}/context`);

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

const runFunction = async ({ testCode, pageId, pageState, functionId, code }: any) => {
	const response = await axios.post(`/task/`, {
		page_id: pageId,
		function_id: functionId,
		test_code: testCode,
		state: pageState,
		code,
	});

	return response.data;
};

export const useRunFunction = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(runFunction, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(WIDGET_PREVIEW_QUERY_KEY);
			queryClient.invalidateQueries(ALL_PAGE_FUNCTIONS_NAMES_QUERY_KEY);
		},
	});
};
