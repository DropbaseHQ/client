import { useMutation, useQueryClient } from 'react-query';
import { WIDGET_PREVIEW_QUERY_KEY } from '@/features/new-app-preview/hooks';
import { workerAxios } from '@/lib/axios';

const executeAction = async ({ pageName, appName, pageState, functionName }: any) => {
	const response = await workerAxios.post(`/function/`, {
		page_name: pageName,
		app_name: appName,
		function_name: functionName,
		payload: JSON.stringify({"state":pageState.state, "context":pageState.context})
		// state: JSON.stringify(pageState.state),
		// context: JSON.stringify(pageState.context),
	});

	return response.data;
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
