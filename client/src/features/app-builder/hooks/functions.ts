import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useMemo } from 'react';

import { workerAxios } from '@/lib/axios';
import { WIDGET_PREVIEW_QUERY_KEY } from '@/features/app-preview/hooks';
import { fetchJobStatus } from '@/utils/worker-job';

export const ALL_PAGE_FUNCTIONS_NAMES_QUERY_KEY = 'functionNames';

const fetchAllPageFunctionNames = async ({ pageId }: any) => {
	const response = await workerAxios.get<any>(`/files/ui_functions/${pageId}/`);
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

const runPythonFunction = async ({ fileCode, testCode, pageState, appName, pageName }: any) => {
	const response = await workerAxios.post(`function/string/`, {
		file_code: fileCode,
		test_code: testCode,
		app_name: appName,
		page_name: pageName,
		state: pageState,
	});

	if (response.data?.job_id) {
		const jobResponse = await fetchJobStatus(response.data.job_id);
		return jobResponse;
	}
	throw new Error('Failed to run python function');
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
