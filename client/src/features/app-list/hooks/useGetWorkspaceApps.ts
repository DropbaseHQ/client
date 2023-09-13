import { useQuery } from 'react-query';
import { axios } from '@/lib/axios';

export type App = {
	name: string;
	workspace_id: string;
	date: string;
	id: string;
	pages: any[];
};

const fetchWorkspaceApps = async () => {
	const { data } = await axios.get<App[]>(`/app/list`);
	return data;
};

export const useGetWorkspaceApps = () => {
	const queryKey = ['workspaceApps'];
	const { data: response, ...rest } = useQuery(queryKey, fetchWorkspaceApps);
	return {
		apps: response || [],
		...rest,
	};
};
