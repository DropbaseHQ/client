import { useQuery } from 'react-query';
import { useMemo } from 'react';
import { useAtom } from 'jotai';
import { axios } from '@/lib/axios';
import { workspaceAtom } from '@/features/workspaces';

export const WORKSPACE_QUERY = 'workspaces';

const fetchWorkspaces = async () => {
	const response = await axios.get<any>(`/user/workspaces`);

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
