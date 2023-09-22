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

const SOURCE_QUERY_KEY = 'source';

const fetchSource = async ({ sourceId }: any) => {
	const response = await axios.get(`/source/${sourceId}`);

	return response.data;
};

export const useSource = (sourceId: any) => {
	const queryKey = [SOURCE_QUERY_KEY, sourceId];
	const { data, ...rest } = useQuery(queryKey, () => fetchSource({ sourceId }), {
		enabled: !!sourceId,
	});

	const source = useMemo(() => {
		return data || {};
	}, [data]);

	return {
		...rest,
		source,
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

const updateSource = async ({ sourceId, name, type, workspaceId, description, creds }: any) => {
	const response = await axios.put(`/source/${sourceId}`, {
		name,
		workspace_id: workspaceId,
		description,
		type,
		creds,
		source_id: sourceId,
	});

	return response.data;
};

export const useUpdateSource = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(updateSource, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(SOURCES_QUERY_KEY);
			queryClient.invalidateQueries(SOURCE_QUERY_KEY);
		},
	});
};

const deleteSource = async ({ sourceId }: any) => {
	const response = await axios.delete(`/source/${sourceId}`);

	return response.data;
};

export const useDeleteSource = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(deleteSource, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(SOURCES_QUERY_KEY);
			queryClient.invalidateQueries(SOURCE_QUERY_KEY);
		},
	});
};
