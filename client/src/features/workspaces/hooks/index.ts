import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAtom } from 'jotai';
import { axios } from '@/lib/axios';
import { workspaceAtom } from '@/features/workspaces';

export const WORKSPACE_QUERY = 'workspaces';

export type Workspace = {
	id: string;
	name: string;
	oldest_string: {
		id: string;
		email: string;
	};
	worker_url?: string;
};

const fetchWorkspaces = async () => {
	const response = await axios.get<Workspace[]>(`/user/workspaces`);

	return response.data;
};

export const useWorkspaces = () => {
	const { pathname } = useLocation();

	const [currentWorkspace, updateWorkspace] = useAtom(workspaceAtom);

	const queryKey = [WORKSPACE_QUERY];
	const loginRoutes =
		pathname.startsWith('/login') ||
		pathname.startsWith('/register') ||
		pathname.startsWith('/reset') ||
		pathname.startsWith('/email-confirmation') ||
		pathname.startsWith('/forgot');

	const { data: response, ...rest } = useQuery(queryKey, () => fetchWorkspaces(), {
		enabled: !loginRoutes,
		onSuccess: (data: any) => {
			const newCurrentWorkspace = data.find(
				(workspace: Workspace) => workspace.id === currentWorkspace.id,
			);
			if (!currentWorkspace?.id) {
				updateWorkspace({ id: data?.[0] });
			} else if (newCurrentWorkspace) {
				updateWorkspace(newCurrentWorkspace);
			}
		},
	});

	const data: any = useMemo(() => {
		return response || [];
	}, [response]);

	return {
		...rest,
		queryKey,
		workspaces: data,
	};
};

const updateWorkspaceWorkerURL = async ({ workspaceId, workerURL }: any) => {
	const response = await axios.put<Workspace>(`/workspace/${workspaceId}`, {
		worker_url: workerURL,
	});

	return response.data;
};

export const useUpdateWorkspaceWorkerURL = () => {
	const queryClient = useQueryClient();
	return useMutation(updateWorkspaceWorkerURL, {
		onSuccess: () => {
			queryClient.refetchQueries(WORKSPACE_QUERY);
		},
	});
};
