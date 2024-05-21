import { useMutation, useQueryClient } from 'react-query';
import { workerAxios } from '@/lib/axios';
import { APPS_QUERY_KEY } from './useGetWorkspaceApps';
import { PAGE_DATA_QUERY_KEY } from '@/features/page';

const updateApp = async ({ appName, newLabel }: any) => {
	const response = await workerAxios.put(`/app/`, {
		app_name: appName,
		new_label: newLabel,
	});
	return response.data;
};

export const useUpdateApp = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(updateApp, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(APPS_QUERY_KEY);
			queryClient.invalidateQueries(PAGE_DATA_QUERY_KEY);
		},
	});
};
