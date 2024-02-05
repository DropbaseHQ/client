import { useAtomValue } from 'jotai';
import { useQuery } from 'react-query';
import { workerAxios } from '@/lib/axios';
import { workspaceAtom } from '@/features/workspaces';

export type App = {
	name: string;
	workspace_id: string;
	date: string;
	id: string;
	pages: any[];
	editable: boolean;
};

const fetchWorkspaceApps = async () => {
	const { data } = await workerAxios.get<App[]>(`/app/list/`);
	return data;
};

export const APPS_QUERY_KEY = 'workspaceApps';

export const useGetWorkspaceApps = () => {
	const { id: workspaceId } = useAtomValue(workspaceAtom);
	const queryKey = [APPS_QUERY_KEY, workspaceId];
	const { data: response, ...rest } = useQuery(queryKey, () => fetchWorkspaceApps(), {
		enabled: !!workspaceId,
	});
	return {
		apps: response || [],
		...rest,
	};
};
