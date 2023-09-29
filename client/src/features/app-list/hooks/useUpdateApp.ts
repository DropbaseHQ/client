import { useMutation, useQueryClient } from 'react-query';
import { axios } from '@/lib/axios';
import { APPS_QUERY_KEY } from './useGetWorkspaceApps';

const updateApp = async ({ appId, name }: any) => {
	const response = await axios.put(`/app/${appId}`, { name });
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
