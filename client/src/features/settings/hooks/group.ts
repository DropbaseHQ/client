import { useMutation, useQuery } from 'react-query';
import { axios } from '@/lib/axios';

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
	const { data } = await axios.get<GroupResponse>(`/group/${groupId}`);
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
	const { data } = await axios.get<GroupUsers[]>(`/group/${groupId}/users`);
	return data;
};

export const useGetGroupUsers = ({ groupId }: { groupId: any }) => {
	const queryKey = ['groupUsers', groupId];
	const { data: response, ...rest } = useQuery(queryKey, () => fetchGroupUsers({ groupId }), {
		enabled: !!groupId,
	});
	return {
		users: response || [],
		...rest,
	};
};

const createGroup = async ({ name, workspaceId }: { name: string; workspaceId: any }) => {
	const response = await axios.post('/group/', { name, workspace_id: workspaceId });
	return response.data;
};

export const useCreateGroup = (mutationConfig?: any) => {
	return useMutation(createGroup, {
		...(mutationConfig || {}),
	});
};

const deleteGroup = async ({ groupId }: { groupId: string }) => {
	const response = await axios.delete(`/group/${groupId}`);
	return response.data;
};

export const useDeleteGroup = (mutationConfig?: any) => {
	return useMutation(deleteGroup, {
		...(mutationConfig || {}),
	});
};

const addUserToGroup = async ({ groupId, userId }: { groupId: string; userId: string }) => {
	const response = await axios.post(`/group/add_user/${groupId}`, { user_id: userId });
	return response.data;
};

export const useAddUserToGroup = (mutationConfig?: any) => {
	return useMutation(addUserToGroup, {
		...(mutationConfig || {}),
	});
};

const removeUserToGroup = async ({ groupId, userId }: { groupId: string; userId: string }) => {
	const response = await axios.post(`/group/remove_user/${groupId}`, { user_id: userId });
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
	const response = await axios.post(`/group/update_policy/${groupId}`, {
		resource,
		action,
	});
	return response.data;
};

export const useUpdateGroupPolicy = (mutationConfig?: any) => {
	return useMutation(updateGroupPolicy, {
		...(mutationConfig || {}),
	});
};
