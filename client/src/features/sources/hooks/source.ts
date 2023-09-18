import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { axios } from '@/lib/axios';

const SOURCES_QUERY_KEY = 'allSources';

const fetchSources = async ({ workspaceId }: any) => {
	const response = await axios.get(`/source/workspace/${workspaceId}`);

	return response.data;
};

export const useSources = (workspaceId: any) => {
	const queryKey = [SOURCES_QUERY_KEY, workspaceId];
	const { data, ...rest } = useQuery(queryKey, () => fetchSources({ workspaceId }), {
		enabled: !!workspaceId,
	});

	const sources = useMemo(() => {
		return data || [];
	}, [data]);

	return {
		...rest,
		sources,
		queryKey,
	};
};

const createSource = async ({ name, type, workspaceId, description, creds }: any) => {
	const response = await axios.post(`/source/`, {
		name,
		workspace_id: workspaceId,
		description,
		type,
		creds,
	});

	return response.data;
};

export const useCreateSource = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(createSource, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(SOURCES_QUERY_KEY);
		},
	});
};
