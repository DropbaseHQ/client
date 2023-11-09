import { useMutation, useQueryClient } from 'react-query';
import { workerAxios } from '@/lib/axios';
import { APPS_QUERY_KEY } from './useGetWorkspaceApps';

const updateApp = async ({ appId, oldName, newName }: any) => {
	const response = await workerAxios.put(`/app/${appId}`, {
		old_name: oldName,
		new_name: newName,
	});
	return response.data;
};

export const useUpdateApp = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(updateApp, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(APPS_QUERY_KEY);
		},
	});
};
