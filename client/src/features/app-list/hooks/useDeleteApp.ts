import { useMutation, useQueryClient } from 'react-query';
import { workerAxios } from '@/lib/axios';
import { APPS_QUERY_KEY } from './useGetWorkspaceApps';

const deleteApp = async (appName: string) => {
	console.log('appName', appName);
	const response = await workerAxios.delete(`/app/${appName}`);
	return response.data;
};

export const useDeleteApp = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(deleteApp, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(APPS_QUERY_KEY);
		},
	});
};
