import { useQuery } from 'react-query';
import { workerAxios } from '@/lib/axios';
import { useStatus } from '@/features/settings/hooks/workspace';

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
	const { isLoading } = useStatus();
	const queryKey = [APPS_QUERY_KEY];
	const { data: response, ...rest } = useQuery(queryKey, () => fetchWorkspaceApps(), {
		staleTime: 1000 * 60 * 5,
		enabled: !isLoading,
	});
	return {
		apps: response || [],
		...rest,
	};
};
