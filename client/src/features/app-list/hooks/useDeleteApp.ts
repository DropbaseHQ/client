import { useMutation, useQueryClient } from 'react-query';
import { axios } from '@/lib/axios';
import { APPS_QUERY_KEY } from './useGetWorkspaceApps';

const deleteApp = async ({ appId }: any) => {
	const response = await axios.delete(`/app/${appId}`);
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
