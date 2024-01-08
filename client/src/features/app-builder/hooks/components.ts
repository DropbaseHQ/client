import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useMemo } from 'react';

import { axios, workerAxios } from '@/lib/axios';
import { WIDGET_PREVIEW_QUERY_KEY } from '@/features/app-preview/hooks';
import { APP_STATE_QUERY_KEY } from '@/features/app-state';

export const WIDGET_PROPERTIES_QUERY_KEY = 'widget/properties';

const fetchTableColumnProperties = async ({ widgetId }: { widgetId: string }) => {
	const response = await axios.get<any>(`/components/widget/${widgetId}`);

	return response.data;
};

export const useGetComponentProperties = (widgetId: string) => {
	const queryKey = [WIDGET_PROPERTIES_QUERY_KEY, widgetId];

	const { data: response, ...rest } = useQuery(
		queryKey,
		() => fetchTableColumnProperties({ widgetId }),
		{
			enabled: Boolean(widgetId),
		},
	);

	const info = useMemo(() => {
		return {
			schema: response?.schema || {},
			values: response?.values || [],
			categories: Object.keys(response?.schema || {}).reduce(
				(agg, type) => ({
					...agg,
					[type]: [
						...new Set(
							response?.schema?.[type]
								?.map((property: any) => property?.category)
								.filter(Boolean) || [],
						),
					],
				}),
				{},
			),
		};
	}, [response]);

	return {
		...rest,
		queryKey,
		...info,
	};
};

const syncComponentsToWorker = async ({ appName, pageName }: any) => {
	const response = await workerAxios.post(`/sync/components/`, {
		app_name: appName,
		page_name: pageName,
	});

	return response.data;
};

export const useSyncComponents = (props: any = {}) => {
	const queryClient = useQueryClient();

	return useMutation(syncComponentsToWorker, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(WIDGET_PROPERTIES_QUERY_KEY);
			queryClient.invalidateQueries(WIDGET_PREVIEW_QUERY_KEY);
			queryClient.invalidateQueries(APP_STATE_QUERY_KEY);
		},
	});
};

const updateComponentProperties = async ({
	payload,
	componentId,
	type,
}: {
	payload: any;
	componentId: string;
	type: string;
}) => {
	const response = await workerAxios.put(`/components/${componentId}/`, {
		property: payload,
		type,
	});
	return response.data;
};

export const useUpdateComponentProperties = (props: any = {}) => {
	const queryClient = useQueryClient();

	return useMutation(updateComponentProperties, {
		...props,

		onSettled: () => {
			queryClient.invalidateQueries(WIDGET_PREVIEW_QUERY_KEY);
			queryClient.invalidateQueries(WIDGET_PREVIEW_QUERY_KEY);
			queryClient.invalidateQueries(APP_STATE_QUERY_KEY);
		},
	});
};

const deleteComponent = async ({ componentId }: any) => {
	const response = await workerAxios.delete(`/components/${componentId}`);
	return response.data;
};

export const useDeleteComponent = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(deleteComponent, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(WIDGET_PROPERTIES_QUERY_KEY);
			queryClient.invalidateQueries(WIDGET_PREVIEW_QUERY_KEY);
			queryClient.invalidateQueries(APP_STATE_QUERY_KEY);
		},
	});
};

const reorderComponents = async ({ widgetId, components }: any) => {
	const response = await axios.post(`/components/reorder`, {
		widget_id: widgetId,
		components,
	});
	return response.data;
};

export const useReorderComponents = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(reorderComponents, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(WIDGET_PROPERTIES_QUERY_KEY);
			queryClient.invalidateQueries(WIDGET_PREVIEW_QUERY_KEY);
		},
	});
};
