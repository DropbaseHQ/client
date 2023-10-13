import { axios } from '@/lib/axios';
import { useQuery } from 'react-query';
import { workspaceAtom } from '@/features/workspaces';
import { useAtomValue } from 'jotai';
const fetchWorkspaceUsers = async ({ workspaceId }: { workspaceId: any }) => {
	const { data } = await axios.get(`/workspace/${workspaceId}/users`);
	return data;
};

export const GET_WORKSPACE_USERS_QUERY_KEY = 'workspaceUsers';
export const useGetWorkspaceUsers = () => {
	const currentWorkspaceId = useAtomValue(workspaceAtom);
	const queryKey = [GET_WORKSPACE_USERS_QUERY_KEY, currentWorkspaceId];
	const { data: response, ...rest } = useQuery(queryKey, () =>
		fetchWorkspaceUsers({ workspaceId: currentWorkspaceId }),
	);
	return {
		users: response || [],
		...rest,
	};
};
