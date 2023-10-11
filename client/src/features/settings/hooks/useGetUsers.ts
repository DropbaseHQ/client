import { axios } from '@/lib/axios';
import { useQuery } from 'react-query';

const fetchWorkspaceUsers = async ({ workspaceId }: { workspaceId: string }) => {
	const { data } = await axios.get(`/workspace/${workspaceId}/users`);
	return data;
};

export const useGetWorkspaceUsers = ({ workspaceId }: { workspaceId: any }) => {
	const queryKey = ['workspaceUsers', workspaceId];
	const { data: response, ...rest } = useQuery(queryKey, () =>
		fetchWorkspaceUsers({ workspaceId }),
	);
	return {
		users: response || [],
		...rest,
	};
};
