import { useMemo, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useAtom } from 'jotai';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/lib/chakra-ui';

import { workerAxios } from '@/lib/axios';
import { pageAtom } from '../atoms';
import { APP_STATE_QUERY_KEY } from '@/features/app-state';
import { APPS_QUERY_KEY } from '@/features/app-list/hooks/useGetWorkspaceApps';

export const PAGE_DATA_QUERY_KEY = 'pageData';

export type FetchPageResponse = {
	state_context: {
		state: any;
		context: any;
		properties: any;
	};
	permissions: {
		use: boolean;
		edit: boolean;
		own: boolean;
	};
};

const fetchPage = async ({ appName, pageName }: any) => {
	const response = await workerAxios.get<FetchPageResponse>(`/page/${appName}/${pageName}`);

	return response.data;
};

export const useGetPage = ({ appName, pageName }: any) => {
	const queryKey = [PAGE_DATA_QUERY_KEY, appName, pageName];
	const navigate = useNavigate();
	const toast = useToast();

	const { data: response, ...rest } = useQuery(queryKey, () => fetchPage({ appName, pageName }), {
		enabled: Boolean(appName && pageName),
		staleTime: Infinity,
	});

	const data: any = useMemo(() => {
		return {
			state: response?.state_context?.state || {},
			context: response?.state_context?.context || {},
			tables: response?.state_context?.properties?.tables || [],
			widgets: response?.state_context?.properties?.widgets || [],
			files: response?.state_context?.properties?.files || [],
			properties: response?.state_context?.properties || {},
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

export const useInitPage = () => {
	const { appName, pageName } = useParams();
	const [context, setPageContext] = useAtom(pageAtom);

	const ref = useRef(false);

	const { widgets, isLoading, isRefetching, ...rest } = useGetPage({
		appName,
		pageName,
	});

	useEffect(() => {
		ref.current = false;
	}, [appName, pageName, isRefetching]);

	useEffect(() => {
		if (!ref.current && !isLoading && !isRefetching) {
			const selectedWidgetIdExists = widgets?.some((w: any) => w.name === context.widgetName);
			const firstWidgetName = selectedWidgetIdExists
				? context?.widgetName
				: widgets?.[0]?.name;

			if (appName && pageName) {
				setPageContext({
					widgetName: firstWidgetName || null,
					pageName,
					appName,
					widgets,
					modals: [],
				});
				ref.current = true;
			}
		}
	}, [isLoading, isRefetching, appName, widgets, pageName, context, setPageContext]);

	useEffect(() => {
		return () => {
			setPageContext({
				widgetName: null,
				pageName: null,
				appName: null,
				widgets: null,
				modals: [],
			});
		};
	}, [setPageContext]);

	return { isLoading, ...rest };
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
			queryClient.invalidateQueries(APP_STATE_QUERY_KEY);

			props?.onSettled?.();
		},
		onSuccess: (data: any, variables: any) => {
			queryClient.invalidateQueries(PAGE_DATA_QUERY_KEY);
			queryClient.invalidateQueries(APP_STATE_QUERY_KEY);

			props?.onSuccess?.(data, variables);
		},
	});
};

const createPage = async ({ appName, pageName }: any) => {
	const response = await workerAxios.post(`/page/`, {
		app_name: appName,
		page_name: pageName,
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
	const response = await workerAxios.put(`/page/${appName}/${pageName}`, {
		new_page_label: newPageLabel,
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
