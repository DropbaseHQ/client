import { axios } from '@/lib/axios';
import { useQuery, useMutation } from 'react-query';
import { workspaceAtom } from '@/features/workspaces';
import { useAtomValue } from 'jotai';

export type UserResponse = {
	user: {
		id: string;
		name: string;
		workspace_id: string;
	};
	workspace_role: {
		workspace_id: string;
		name: string;
		id: string;
	};
	permissions: {
		group_id: string;
		resource: string;
		action: string;
	}[];
};

const fetchUser = async ({ userId, workspaceId }: { userId: string; workspaceId: any }) => {
	const { data } = await axios.get<UserResponse>(`/user/${userId}/details/${workspaceId}`);
	return data;
};

export const useGetUserDetails = ({ userId }: { userId: any }) => {
	const { id: currentWorkspaceId } = useAtomValue(workspaceAtom);

	const queryKey = ['user', userId, currentWorkspaceId];
	const { data: response, ...rest } = useQuery(
		queryKey,
		() => fetchUser({ userId, workspaceId: currentWorkspaceId }),
		{ enabled: !!userId && !!currentWorkspaceId },
	);
	return {
		user: response?.user || {},
		permissions: response?.permissions || [],
		workspaceRole: response?.workspace_role,
		...rest,
	};
};

const updateUserPolicy = async ({
	userId,
	resource,
	action,
	workspaceId,
}: {
	userId: string;
	resource: string;
	action: string;
	workspaceId: string;
}) => {
	const response = await axios.post(`/user/update_policy/${userId}`, {
		resource,
		action,
		workspace_id: workspaceId,
	});
	return response.data;
};

export const useUpdateUserPolicy = (mutationConfig?: any) => {
	return useMutation(updateUserPolicy, {
		...(mutationConfig || {}),
	});
};
