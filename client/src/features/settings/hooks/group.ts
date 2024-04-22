import { useMutation, useQuery } from 'react-query';
import { workerAxios } from '@/lib/axios';
import { useToast } from '@/lib/chakra-ui';

export type GroupResponse = {
	group: {
		id: string;
		name: string;
		workspace_id: string;
	};
	permissions: {
		group_id: string;
		resource: string;
		action: string;
	}[];
};

const fetchGroup = async ({ groupId }: { groupId: string }) => {
	const { data } = await workerAxios.get<GroupResponse>(`/group/${groupId}`);
	return data;
};

export const useGetGroup = ({ groupId }: { groupId: any }) => {
	const queryKey = ['group', groupId];
	const { data: response, ...rest } = useQuery(queryKey, () => fetchGroup({ groupId }), {
		enabled: !!groupId,
	});
	return {
		group: response?.group || {},
		permissions: response?.permissions || [],
		...rest,
	};
};

export type GroupUsers = {
	id: string;
	email: string;
	name: string;
	role: string;
};

const fetchGroupUsers = async ({ groupId }: { groupId: string }) => {
	const { data } = await workerAxios.get<GroupUsers[]>(`/group/${groupId}/users`);
	return data;
};

export const useGetGroupUsers = ({ groupId }: { groupId: any }) => {
	const queryKey = ['groupUsers', groupId];
	const { data: response, ...rest } = useQuery(queryKey, () => fetchGroupUsers({ groupId }), {
		enabled: !!groupId,
		staleTime: Infinity,
	});
	return {
		users: response || [],
		...rest,
	};
};

const createGroup = async ({ name, workspaceId }: { name: string; workspaceId: any }) => {
	const response = await workerAxios.post('/group/', { name, workspace_id: workspaceId });
	return response.data;
};

export const useCreateGroup = (mutationConfig?: any) => {
	return useMutation(createGroup, {
		...(mutationConfig || {}),
	});
};

const deleteGroup = async ({ groupId }: { groupId: string }) => {
	const response = await workerAxios.delete(`/group/${groupId}`);
	return response.data;
};

export const useDeleteGroup = (mutationConfig?: any) => {
	return useMutation(deleteGroup, {
		...(mutationConfig || {}),
	});
};

const addUserToGroup = async ({ groupId, userId }: { groupId: string; userId: string }) => {
	const response = await workerAxios.post(`/group/add_user/${groupId}`, { user_id: userId });
	return response.data;
};

export const useAddUserToGroup = (mutationConfig?: any) => {
	return useMutation(addUserToGroup, {
		...(mutationConfig || {}),
	});
};

const removeUserToGroup = async ({ groupId, userId }: { groupId: string; userId: string }) => {
	const response = await workerAxios.post(`/group/remove_user/${groupId}`, { user_id: userId });
	return response.data;
};

export const useRemoveUserFromGroup = (mutationConfig?: any) => {
	return useMutation(removeUserToGroup, {
		...(mutationConfig || {}),
	});
};

const updateGroupPolicy = async ({
	groupId,
	resource,
	action,
}: {
	groupId: string;
	resource: string;
	action: string;
}) => {
	const response = await workerAxios.post(`/group/update_policy/${groupId}`, {
		resource,
		action,
	});
	return response.data;
};

export const useUpdateGroupPolicy = (mutationConfig?: any) => {
	const toast = useToast();
	return useMutation(updateGroupPolicy, {
		...(mutationConfig || {}),
		onSuccess: () => {
			mutationConfig?.onSuccess?.();
			toast({
				title: 'Group permission updated',
				status: 'success',
			});
		},
		onError: () => {
			mutationConfig?.onError?.();
			toast({
				title: 'Error updating group permission',
				status: 'error',
			});
		},
	});
};
