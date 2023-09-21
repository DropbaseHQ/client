import { useQuery } from 'react-query';
import { useMemo } from 'react';
import { axios } from '@/lib/axios';

export const WORKSPACE_QUERY = 'workspaces';

const fetchWorkspaces = async () => {
	const response = await axios.get<any>(`/user/workspaces`);

	return response.data;
};

export const useWorkspaces = () => {
	const queryKey = [WORKSPACE_QUERY];

	const { data: response, ...rest } = useQuery(queryKey, () => fetchWorkspaces());

	const data: any = useMemo(() => {
		return response || {};
	}, [response]);

	return {
		...rest,
		queryKey,
		...data,
	};
};
