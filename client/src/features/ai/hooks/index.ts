import { useMutation, useQueryClient } from 'react-query';
import { workerAxios } from '@/lib/axios';
import { PAGE_DATA_QUERY_KEY } from '@/features/page';

const submitPrompt = async ({ appName, pageName, type, prompt }: any) => {
	const response = await workerAxios.post(`/page/prompt/`, {
		type,
		prompt,
		app_name: appName,
		page_name: pageName,
	});
	return response.data;
};

export const useSubmitPrompt = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(submitPrompt, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(PAGE_DATA_QUERY_KEY);
		},
	});
};
