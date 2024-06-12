import { useMutation, useQueryClient } from 'react-query';

import { workerAxios } from '@/lib/axios';
import { WIDGET_PREVIEW_QUERY_KEY } from '@/features/app-preview/hooks';
import { fetchJobStatus } from '@/utils/worker-job';

export const ALL_PAGE_FUNCTIONS_NAMES_QUERY_KEY = 'functionNames';

const runPythonFunction = async ({ code, test, pageState }: any) => {
	const response = await workerAxios.post(`function/string/`, {
		code,
		test,
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
