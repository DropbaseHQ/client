import { useQuery, useMutation } from 'react-query';
import { useAtomValue } from 'jotai';
import { workerAxios } from '@/lib/axios';
import { workspaceAtom } from '@/features/workspaces';
import { useToast } from '@/lib/chakra-ui';

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
	const { data } = await workerAxios.get<UserResponse>(`/user/${userId}/details/${workspaceId}`);
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
	const response = await workerAxios.post(`/user/update_policy/${userId}`, {
		resource,
		action,
		workspace_id: workspaceId,
	});
	return response.data;
};

export const useUpdateUserPolicy = (mutationConfig?: any) => {
	const toast = useToast();
	return useMutation(updateUserPolicy, {
		...(mutationConfig || {}),
		onSuccess: () => {
			toast({
				title: 'User permissions updated',
				status: 'success',
			});
		},
		onError: () => {
			toast({
				title: 'Error updating user permissions',
				status: 'error',
			});
		},
	});
};
