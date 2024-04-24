import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useMemo } from 'react';

import { workerAxios } from '@/lib/axios';

export const PROXY_TOKENS_QUERY_KEY = 'proxyTokens';

export type ProxyToken = {
	token: string;
	id: string;
	is_selected: boolean;
	owner_selected: boolean;
	name?: string;
	region?: string;
};
const fetchProxyTokens = async ({ workspaceId, userId }: any) => {
	const response = await workerAxios.get<ProxyToken[]>(`/token/${workspaceId}/${userId}`);

	return response.data;
};

export const useProxyTokens = ({ workspaceId, userId }: any) => {
	const queryKey = [PROXY_TOKENS_QUERY_KEY, workspaceId, userId];

	const { data: response, ...rest } = useQuery(
		queryKey,
		() => fetchProxyTokens({ workspaceId, userId }),
		{
			enabled: Boolean(workspaceId && userId),
		},
	);

	const info = useMemo(() => {
		return {
			tokens: response || [],
		};
	}, [response]);

	return {
		...rest,
		queryKey,
		...info,
	};
};

const createProxyToken = async ({ workspaceId, name }: { workspaceId: string; name?: string }) => {
	const response = await workerAxios.post(`/token/`, {
		workspace_id: workspaceId,
		name,
	});
	return response.data;
};

export const useCreateProxyToken = (props: any = {}) => {
	const queryClient = useQueryClient();

	return useMutation(createProxyToken, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(PROXY_TOKENS_QUERY_KEY);
		},
	});
};

const updateWorkspaceProxyToken = async ({ workspaceId, tokenId }: any) => {
	const response = await workerAxios.put(`/workspace_control/${workspaceId}/token`, {
		token_id: tokenId,
	});
	return response.data;
};

export const useUpdateWorkspaceProxyToken = (props: any = {}) => {
	const queryClient = useQueryClient();

	return useMutation(updateWorkspaceProxyToken, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(PROXY_TOKENS_QUERY_KEY);
		},
	});
};

const updateTokenInfo = async ({ tokenId, name, region }: any) => {
	const response = await workerAxios.put(`/token/${tokenId}`, {
		name,
		region,
	});
	return response.data;
};

export const useUpdateTokenInfo = (props: any = {}) => {
	const queryClient = useQueryClient();

	return useMutation(updateTokenInfo, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(PROXY_TOKENS_QUERY_KEY);
		},
	});
};

const deleteProxyToken = async ({ tokenId }: any) => {
	const response = await workerAxios.delete(`/token/${tokenId}`);
	return response.data;
};

export const useDeleteProxyToken = (props: any = {}) => {
	const queryClient = useQueryClient();

	return useMutation(deleteProxyToken, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(PROXY_TOKENS_QUERY_KEY);
		},
	});
};
