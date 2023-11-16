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
	token_id: string;
	is_selected: boolean;
	owner_selected: boolean;
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

const createProxyToken = async ({ userId, workspaceId }: any) => {
	const response = await axios.post(`/token/`, {
		token: '',
		user_id: userId,
		workspace_id: workspaceId,
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
	const workspaceId = useAtomValue(workspaceAtom);
	const { user, isLoading: isLoadingUser } = useGetCurrentUser();

	const [token, setToken] = useAtom(proxyTokenAtom);

	const { isLoading, tokens } = useProxyTokens({ userId: user.id, workspaceId });

	const isValid = token && tokens.find((t) => t.token === token);

	useEffect(() => {
		const selectedToken = tokens.find((t) => t.is_selected);
		if (selectedToken) {
			setToken(selectedToken.token);
		}
	}, [tokens]);

	useEffect(() => {
		if (token) {
			workerAxios.defaults.headers['dropbase-proxy-token'] = token;
		}
	}, [token]);

	return { token, isLoading: isLoadingUser || isLoading, isValid };
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
