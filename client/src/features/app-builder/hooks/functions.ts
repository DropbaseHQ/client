import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useMemo } from 'react';

import { axios, workerAxios } from '@/lib/axios';
import { WIDGET_PREVIEW_QUERY_KEY } from '@/features/app-preview/hooks';
import { fetchJobStatus } from '@/utils/worker-job';
import { el } from 'date-fns/locale';

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

const runPythonFunction = async ({ fileCode, testCode, pageState }: any) => {
	const response = await workerAxios.post(`query/test_python_string/`, {
		file_code: fileCode,
		test_code: testCode, 
		...pageState
	});

	if (response.data?.job_id){
		const jobResponse = await fetchJobStatus(response.data.job_id);
		return jobResponse;
	}
	else {
		console.error("No associated job id found")
		throw new Error('Failed to run python function');
	}
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
