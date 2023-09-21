import { useMutation, useQueryClient } from 'react-query';
import { WIDGET_PREVIEW_QUERY_KEY } from '@/features/new-app-preview/hooks';
import { axios } from '@/lib/axios';

const executeAction = async ({ pageId, pageState, functionName }: any) => {
	const response = await axios.post(`/task/function`, {
		page_id: pageId,
		function_name: functionName,
		state: pageState,
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
