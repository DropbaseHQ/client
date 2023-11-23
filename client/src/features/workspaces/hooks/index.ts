import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useMemo } from 'react';
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
	const [currentWorkspace, updateWorkspace] = useAtom(workspaceAtom);
	const queryKey = [WORKSPACE_QUERY];

	const { data: response, ...rest } = useQuery(queryKey, () => fetchWorkspaces(), {
		onSuccess: (data: any) => {
			if (!currentWorkspace) {
				updateWorkspace(data?.[0]?.id);
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
	console.log('workerURL', workerURL);
	const response = await axios.put<Workspace>(`/workspace/${workspaceId}`, {
		worker_url: workerURL,
	});

	return response.data;
};

export const useUpdateWorkspaceWorkerURL = () => {
	const queryClient = useQueryClient();
	return useMutation(updateWorkspaceWorkerURL, {
		onSuccess: (_: any) => {
			queryClient.refetchQueries(WORKSPACE_QUERY);
		},
	});
};
