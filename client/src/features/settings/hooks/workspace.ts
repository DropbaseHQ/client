import { axios } from '@/lib/axios';
import { useQuery, useMutation } from 'react-query';
import { workspaceAtom } from '@/features/workspaces';
import { useAtomValue } from 'jotai';

export type Group = {
	id: string;
	name: string;
	workspace_id: string;
	date: string;
};
const fetchWorkspaceGroups = async ({ workspaceId }: { workspaceId: string }) => {
	const { data } = await axios.get<Group[]>(`/workspace/${workspaceId}/groups`);
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

export type WorkspaceUser = {
	id: string;
	name: string;
	email: string;
	role_name: string;
	role_id: string;
	date: string;
	groups: Group[];
};

const fetchWorkspaceUsers = async ({ workspaceId }: { workspaceId: any }) => {
	const { data } = await axios.get<WorkspaceUser[]>(`/workspace/${workspaceId}/users`);
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

const inviteMember = async ({
	email,
	workspaceId,
	roleId,
}: {
	email: string;
	workspaceId: any;
	roleId: string;
}) => {
	const response = await axios.post(`/workspace/${workspaceId}/add_user`, {
		user_email: email,
		role_id: roleId,
	});
	return response.data;
};

export const useInviteMember = (mutationConfig?: any) => {
	return useMutation(inviteMember, {
		...(mutationConfig || {}),
	});
};

const removeMember = async ({ userId, workspaceId }: { userId: string; workspaceId: any }) => {
	const response = await axios.post(`/workspace/${workspaceId}/remove_user`, {
		user_id: userId,
	});
	return response.data;
};

export const useRemoveMember = (mutationConfig?: any) => {
	return useMutation(removeMember, {
		...(mutationConfig || {}),
	});
};

const updateUserRole = async ({
	userId,
	roleId,
	workspaceId,
}: {
	userId: string;
	roleId: string;
	workspaceId: any;
}) => {
	const response = await axios.put(`/workspace/${workspaceId}/user_role`, {
		user_id: userId,
		role_id: roleId,
	});
	return response.data;
};

export const useUpdateUserRole = (mutationConfig?: any) => {
	return useMutation(updateUserRole, {
		...(mutationConfig || {}),
	});
};
