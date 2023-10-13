import { axios } from '@/lib/axios';
import { useQuery } from 'react-query';

const fetchWorkspaceUsers = async ({ workspaceId }: { workspaceId: string }) => {
	const { data } = await axios.get(`/workspace/${workspaceId}/users`);
	return data;
};

export const GET_WORKSPACE_USERS_QUERY_KEY = 'workspaceUsers';
export const useGetWorkspaceUsers = ({ workspaceId }: { workspaceId: any }) => {
	const queryKey = [GET_WORKSPACE_USERS_QUERY_KEY, workspaceId];
	const { data: response, ...rest } = useQuery(queryKey, () =>
		fetchWorkspaceUsers({ workspaceId }),
	);
	return {
		users: response || [],
		...rest,
	};
};
