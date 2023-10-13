import { useAtomValue } from 'jotai';
import { useQuery } from 'react-query';
import { axios } from '@/lib/axios';
import { workspaceAtom } from '@/features/workspaces';

export type App = {
	name: string;
	workspace_id: string;
	date: string;
	id: string;
	pages: any[];
};

const fetchWorkspaceApps = async ({ workspaceId }: { workspaceId: any }) => {
	const { data } = await axios.get<App[]>(`/app/list/${workspaceId}`);
	return data;
};

export const APPS_QUERY_KEY = 'workspaceApps';

export const useGetWorkspaceApps = () => {
	const workspaceId = useAtomValue(workspaceAtom);
	const queryKey = [APPS_QUERY_KEY, workspaceId];
	const { data: response, ...rest } = useQuery(queryKey, () =>
		fetchWorkspaceApps({ workspaceId }),
	);
	return {
		apps: response || [],
		...rest,
	};
};
