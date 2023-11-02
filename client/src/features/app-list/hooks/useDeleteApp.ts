import { useMutation, useQueryClient } from 'react-query';
import { workerAxios } from '@/lib/axios';
import { APPS_QUERY_KEY } from './useGetWorkspaceApps';

const deleteApp = async ({ appId, appName }: any) => {
	const response = await workerAxios.delete(`/workspace_admin/delete_app/${appId}`, {
		data: {
			app_name: appName,
		},
	});
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
