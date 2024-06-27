import { useEffect, useMemo, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useAtomValue, useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/lib/chakra-ui';

import { workerAxios } from '@/lib/axios';

import { APPS_QUERY_KEY } from '@/features/app-list/hooks/useGetWorkspaceApps';
import { pageFetchedAtom } from '@/features/page/atoms';
import { PAGE_FILE_QUERY_KEY } from '@/features/app-builder/hooks';

export const PAGE_DATA_QUERY_KEY = 'pageData';

export type FetchPageResponse = {
	state: any;
	context: any;
	properties: any;

	permissions: {
		use: boolean;
		edit: boolean;
		own: boolean;
	};

	methods?: {
		[key: string]: any;
	};
};

const fetchPage = async ({ appName, pageName }: any) => {
	const response = await workerAxios.get<FetchPageResponse>(`/page/${appName}/${pageName}`);

	return response.data;
};

export const useGetPage = ({ appName, pageName, ...props }: any) => {
	const setPageFetched = useSetAtom(pageFetchedAtom);
	const queryKey = [PAGE_DATA_QUERY_KEY, appName, pageName];
	const navigate = useNavigate();
	const toast = useToast();

	const { data: response, ...rest } = useQuery(queryKey, () => fetchPage({ appName, pageName }), {
		enabled: Boolean(appName && pageName),
		staleTime: Infinity,
		retry: false,
		...props,
	});

	useEffect(() => {
		setPageFetched(Date.now());
	}, [response, setPageFetched]);

	const data: any = useMemo(() => {
		const allProperties = response?.properties || {};
		const allBlocks: any = Object.keys(allProperties);

		return {
			state: response?.state || {},
			context: response?.context || {},
			tables: allBlocks
				.filter((b: any) => allProperties[b]?.block_type === 'table')
				.map((b: any) => allProperties[b]),
			widgets: allBlocks
				.filter((b: any) => allProperties[b].block_type === 'widget')
				.map((b: any) => allProperties[b]),
			charts: allBlocks
				.filter((b: any) => allProperties[b].block_type === 'chart')
				.map((b: any) => allProperties[b]),
			files: response?.properties?.files || [
				{
					title: 'function',
					name: 'main',
					type: 'python',
				},
				{
					title: 'ui',
					name: 'properties',
					type: 'json',
				},
			],
			allBlocks: allBlocks.map((b: any) => allProperties[b]),
			properties: allProperties,
			permissions: response?.permissions || {
				edit: true,
				own: true,
			},
			availableMethods: response?.methods || {},
		};
	}, [response]);

	if (rest?.error) {
		const errorStatusCode = (rest.error as any)?.response?.status;
		if (errorStatusCode === 403) {
			toast.closeAll();
			toast({
				title: 'Unauthorized',
				description: 'You do not have permission to view this page.',
				status: 'error',
			});
			navigate('/apps');
		}
	}

	return {
		...rest,
		queryKey,
		...data,
	};
};

const updatePageData = async (data: any) => {
	const response = await workerAxios.put(`/page/`, data);
	return response.data;
};

export const useUpdatePageData = (props: any = {}) => {
	const queryClient = useQueryClient();

	return useMutation(updatePageData, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(PAGE_DATA_QUERY_KEY);
			queryClient.invalidateQueries(PAGE_FILE_QUERY_KEY);

			props?.onSettled?.();
		},
		onSuccess: (data: any, variables: any) => {
			queryClient.invalidateQueries(PAGE_DATA_QUERY_KEY);

			props?.onSuccess?.(data, variables);
		},
	});
};

const createPage = async ({ appName, pageName, pageLabel }: any) => {
	const response = await workerAxios.post(`/page/`, {
		app_name: appName,
		page_name: pageName,
		page_label: pageLabel,
	});
	return response.data;
};

export const useCreatePage = () => {
	const queryClient = useQueryClient();

	return useMutation(createPage, {
		onSuccess: () => {
			queryClient.invalidateQueries(APPS_QUERY_KEY);
		},
	});
};

const renamePage = async ({ appName, pageName, newPageLabel }: any) => {
	const response = await workerAxios.put(`/page/rename/`, {
		app_name: appName,
		page_name: pageName,
		page_label: newPageLabel,
	});
	return response.data;
};

export const useRenamePage = () => {
	const queryClient = useQueryClient();

	return useMutation(renamePage, {
		onSuccess: () => {
			queryClient.invalidateQueries(APPS_QUERY_KEY);
		},
	});
};

const deletePage = async ({ appName, pageName }: any) => {
	const response = await workerAxios.delete(`/page/${appName}/${pageName}`);
	return response.data;
};

export const useDeletePage = () => {
	const queryClient = useQueryClient();

	return useMutation(deletePage, {
		onSuccess: () => {
			queryClient.invalidateQueries(APPS_QUERY_KEY);
		},
	});
};

export const useOnPageResponse = (f: any) => {
	const pageFetched = useAtomValue(pageFetchedAtom);
	const functionRef = useRef(f);
	functionRef.current = f;

	useEffect(() => {
		if (functionRef.current) {
			functionRef.current?.();
		}
	}, [pageFetched]);
};
