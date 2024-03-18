import { useAtomValue } from 'jotai';
import { useQuery } from 'react-query';
import { workerAxios } from '@/lib/axios';
import { workspaceAtom } from '@/features/workspaces';

type Page = {
	name: string;
	label: string;
	id: string;
};

export type App = {
	name: string;
	status?: string;
	label: string;
	workspace_id: string;
	date: string;
	id: string;
	pages: Page[];
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
		staleTime: 1000 * 60 * 5,
	});
	return {
		apps: response || [],
		...rest,
	};
};
