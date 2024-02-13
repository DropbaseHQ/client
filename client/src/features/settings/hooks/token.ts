import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useEffect, useMemo } from 'react';

import { useAtomValue, useAtom } from 'jotai';
import { axios, workerAxios } from '@/lib/axios';
import { workspaceAtom } from '@/features/workspaces';
import { useGetCurrentUser } from '@/features/authorization/hooks/useGetUser';
import { proxyTokenAtom } from '@/features/settings/atoms';

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
	const response = await axios.get<ProxyToken[]>(`/token/${workspaceId}/${userId}`);

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
	const response = await axios.post(`/token/`, {
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

export const useSyncProxyToken = () => {
	const { id: workspaceId } = useAtomValue(workspaceAtom);
	const { user, isLoading: isLoadingUser } = useGetCurrentUser();

	const [token, setToken] = useAtom(proxyTokenAtom);

	const { isLoading, isFetched, tokens } = useProxyTokens({ userId: user.id, workspaceId });

	const isValid = token && tokens.find((t) => t.token === token);
	const hasTokens = tokens.length > 0;

	useEffect(() => {
		const selectedToken = tokens.find((t) => t.is_selected);
		if (selectedToken) {
			setToken(selectedToken.token);
		} else if (isFetched && tokens.length <= 0) {
			setToken(null);
		}
	}, [tokens, workspaceId, isFetched, setToken]);

	useEffect(() => {
		workerAxios.defaults.headers['dropbase-proxy-token'] = token;
	}, [token]);

	return { token, isLoading: isLoadingUser || isLoading, isValid, hasTokens };
};

const updateWorkspaceProxyToken = async ({ workspaceId, tokenId }: any) => {
	const response = await axios.put(`/workspace/${workspaceId}/token`, {
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
	const response = await axios.put(`/token/${tokenId}`, {
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
	const response = await axios.delete(`/token/${tokenId}`);
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
