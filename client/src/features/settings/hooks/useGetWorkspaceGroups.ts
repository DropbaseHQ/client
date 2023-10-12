import { axios } from '@/lib/axios';
import { useQuery } from 'react-query';

const fetchWorkspaceGroups = async ({ workspaceId }: { workspaceId: string }) => {
	const { data } = await axios.get(`/workspace/${workspaceId}/groups`);
	return data;
};

export const GET_WORKSPACE_GROUPS_QUERY_KEY = 'workspaceGroups';
export const useGetWorkspaceGroups = ({ workspaceId }: { workspaceId: any }) => {
	const queryKey = [GET_WORKSPACE_GROUPS_QUERY_KEY, workspaceId];
	const { data: response, ...rest } = useQuery(queryKey, () =>
		fetchWorkspaceGroups({ workspaceId }),
	);
	return {
		groups: response || [],
		...rest,
	};
};
