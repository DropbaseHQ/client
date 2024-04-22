import { useAtomValue } from 'jotai';

import { useMutation, useQuery, useQueryClient } from 'react-query';
import { workerAxios } from '@/lib/axios';
import { workspaceAtom } from '@/features/workspaces';
import { isFreeApp } from '@/utils';

export type URLMapping = {
	id: string;
	name?: string;
	client_url: string;
	worker_url: string;
	lsp_url: string;
};

const fetchURLMappings = async ({ workspaceId }: { workspaceId: string }) => {
	const { data } = await workerAxios.get<URLMapping[]>(`/url_mapping/${workspaceId}`);
	return data;
};

export const useURLMappings = () => {
	const workspaceId = useAtomValue(workspaceAtom)?.id;
	const queryKey = ['urlMappings', workspaceId];
	const { data, ...rest } = useQuery(
		queryKey,
		() => fetchURLMappings({ workspaceId: workspaceId || '' }),
		{
			enabled: !!workspaceId && !isFreeApp(),
			staleTime: Infinity,
			cacheTime: Infinity,
		},
	);
	return {
		urlMappings: data || [],
		...rest,
	};
};

const createURLMapping = async ({
	client_url,
	worker_url,
	lsp_url,
	workspaceId,
}: {
	client_url: string;
	worker_url: string;
	lsp_url: string;
	workspaceId: string;
}) => {
	const response = await workerAxios.post('/url_mapping/', {
		client_url,
		worker_url,
		lsp_url,
		workspace_id: workspaceId,
	});
	return response.data;
};

export const useCreateURLMapping = () => {
	const queryClient = useQueryClient();
	return useMutation(createURLMapping, {
		onSuccess: () => {
			queryClient.invalidateQueries('urlMappings');
		},
	});
};

const deleteURLMapping = async ({ id }: { id: string }) => {
	const response = await workerAxios.delete(`/url_mapping/${id}`);
	return response.data;
};

export const useDeleteURLMapping = () => {
	const queryClient = useQueryClient();
	return useMutation(deleteURLMapping, {
		onSuccess: () => {
			queryClient.invalidateQueries('urlMappings');
		},
	});
};

const updateURLMapping = async ({
	id,
	client_url,
	worker_url,
	lsp_url,
}: {
	id: string;
	client_url: string;
	worker_url: string;
	lsp_url: string;
}) => {
	const response = await workerAxios.put(`/url_mapping/${id}`, {
		client_url,
		worker_url,
		lsp_url,
	});
	return response.data;
};

export const useUpdateURLMapping = () => {
	const queryClient = useQueryClient();
	return useMutation(updateURLMapping, {
		onSuccess: () => {
			queryClient.invalidateQueries('urlMappings');
		},
	});
};
