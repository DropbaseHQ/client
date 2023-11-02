import { useMutation, useQueryClient } from 'react-query';
import { WIDGET_PREVIEW_QUERY_KEY } from '@/features/app-preview/hooks';
import { workerAxios } from '@/lib/axios';

const executeAction = async ({ pageName, appName, pageState, functionName }: any) => {
	const response = await workerAxios.post(`/function/`, {
		page_name: pageName,
		app_name: appName,
		function_name: functionName,
		payload: pageState,
	});

	return response.data?.result;
};

export const useExecuteAction = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(executeAction, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(WIDGET_PREVIEW_QUERY_KEY);
		},
	});
};
