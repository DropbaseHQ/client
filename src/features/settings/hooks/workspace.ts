import { useQuery, useMutation } from 'react-query';
import { useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { workerAxios } from '@/lib/axios';
import { workspaceAtom } from '@/features/workspaces';
import { useGetWorkspaceApps } from '@/features/app-list/hooks/useGetWorkspaceApps';

export type Group = {
	id: string;
	name: string;
	workspace_id: string;
	date: string;
};
const fetchWorkspaceGroups = async ({ workspaceId }: { workspaceId: any }) => {
	const { data } = await workerAxios.get<Group[]>(`/workspace_control/${workspaceId}/groups`);
	return data;
};

export const GET_WORKSPACE_GROUPS_QUERY_KEY = 'workspaceGroups';
export const useGetWorkspaceGroups = () => {
	const { id: currentWorkspaceId } = useAtomValue(workspaceAtom);
	const queryKey = [GET_WORKSPACE_GROUPS_QUERY_KEY, currentWorkspaceId];
	const { data: response, ...rest } = useQuery(
		queryKey,
		() => fetchWorkspaceGroups({ workspaceId: currentWorkspaceId }),
		{ enabled: !!currentWorkspaceId, staleTime: Infinity },
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
	const { data } = await workerAxios.get<WorkspaceUser[]>(
		`/workspace_control/${workspaceId}/users/`,
	);
	return data;
};

export const GET_WORKSPACE_USERS_QUERY_KEY = 'workspaceUsers';
export const useGetWorkspaceUsers = () => {
	const { id: currentWorkspaceId } = useAtomValue(workspaceAtom);
	const queryKey = [GET_WORKSPACE_USERS_QUERY_KEY, currentWorkspaceId];
	const { data: response, ...rest } = useQuery(
		queryKey,
		() => fetchWorkspaceUsers({ workspaceId: currentWorkspaceId }),
		{ enabled: !!currentWorkspaceId, staleTime: Infinity },
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
	const response = await workerAxios.post(`/workspace_control/${workspaceId}/add_user`, {
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
	const response = await workerAxios.post(`/workspace_control/${workspaceId}/remove_user`, {
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
	const response = await workerAxios.put(`/workspace_control/${workspaceId}/user_role`, {
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

const updateAppPolicy = async ({
	appId,
	subjects,
	action,
}: {
	appId: string;
	subjects: string[];
	action: string;
}) => {
	const response = await workerAxios.post(`/app/${appId}/share`, {
		subjects,
		action,
	});
	return response.data;
};

export const useUpdateAppPolicy = (mutationConfig?: any) => {
	return useMutation(updateAppPolicy, {
		...(mutationConfig || {}),
	});
};

type AppAccess = {
	users: {
		id: string;
		permission: string;
	}[];
	groups: {
		id: string;
		permission: string;
	}[];
};

const fetchAppAccess = async ({ appId }: { appId: string }) => {
	const response = await workerAxios.get<AppAccess>(`/app/${appId}/has_access`);
	return response.data;
};

export const useGetAppAccess = () => {
	const { appName } = useParams();
	const { apps } = useGetWorkspaceApps();

	const currentApp = apps?.find((app: any) => app.name === appName);
	const { data, ...rest } = useQuery(
		['appAccess'],
		() => fetchAppAccess({ appId: currentApp?.id || '' }),
		{
			enabled: !!currentApp?.id,
		},
	);

	return {
		userAccess: data?.users || [],
		groupAccess: data?.groups || [],
		...rest,
	};
};
