import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAtom } from 'jotai';
import { axios, workerAxios } from '@/lib/axios';
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

	const [, updateWorkspace] = useAtom(workspaceAtom);
	const { workspace: workerWorkspaceInfo } = useWorkerWorkspace();

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
			const workerWorkspace = data?.find(
				(workspace: Workspace) => workspace.id === workerWorkspaceInfo?.id,
			);
			if (workerWorkspace) {
				updateWorkspace(workerWorkspace);
			} else {
				updateWorkspace(data?.[0]);
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

type WorkerWorkspace = {
	id: string;
	name: string;
	description: string;
};

const getWorkerWorkspace = async () => {
	const response = await workerAxios.get<WorkerWorkspace>(`/worker_workspace/`);
	return response.data;
};

export const useWorkerWorkspace = () => {
	const { data: response, ...rest } = useQuery('workerWorkspace', getWorkerWorkspace);

	return {
		...rest,
		workspace: response,
	};
};
