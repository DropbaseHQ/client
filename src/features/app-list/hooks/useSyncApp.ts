import { useMutation, useQueryClient } from 'react-query';
import { workerAxios } from '@/lib/axios';
import { APPS_QUERY_KEY } from './useGetWorkspaceApps';

const syncApp = async ({ appName, generateNew }: any) => {
	const response = await workerAxios.post(`/app/sync_app`, {
		app_name: appName,
		generate_new: generateNew,
	});
	return response.data;
};

export const useSyncApp = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(syncApp, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(APPS_QUERY_KEY);
		},
	});
};
