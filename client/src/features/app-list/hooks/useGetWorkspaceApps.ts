import { axios } from '@/lib/axios';
import { useQuery } from 'react-query';

export type App = {
	name: string;
	workspace_id: string;
	date: string;
	id: string;
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
