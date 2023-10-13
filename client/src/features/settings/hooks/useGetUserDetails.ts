import { axios } from '@/lib/axios';
import { useQuery } from 'react-query';

export type UserResponse = {
	user: {
		id: string;
		name: string;
		workspace_id: string;
	};
	workspace_role: string;
	permissions: {
		group_id: string;
		resource: string;
		action: string;
	}[];
};

const fetchUser = async ({ userId, workspaceId }: { userId: string; workspaceId: string }) => {
	const { data } = await axios.get<UserResponse>(`/user/${userId}/details/${workspaceId}`);
	return data;
};

export const useGetUserDetails = ({ userId, workspaceId }: { userId: any; workspaceId: any }) => {
	const queryKey = ['user', userId];
	const { data: response, ...rest } = useQuery(queryKey, () =>
		fetchUser({ userId, workspaceId }),
	);
	return {
		user: response?.user || {},
		permissions: response?.permissions || [],
		workspaceRole: response?.workspace_role || '',
		...rest,
	};
};
