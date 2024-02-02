import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSetAtom } from 'jotai';
import { useMemo } from 'react';

import { axios, workerAxios } from '@/lib/axios';
import { WIDGET_PREVIEW_QUERY_KEY } from '@/features/app-preview/hooks';
import { PAGE_DATA_QUERY_KEY, pageAtom, useUpdatePageData } from '@/features/page';
import { useToast } from '@/lib/chakra-ui';
import { APP_STATE_QUERY_KEY } from '@/features/app-state';
import { getErrorMessage } from '@/utils';

export const WIDGET_QUERY_KEY = 'widget';

const fetchWidgetInfo = async ({ widgetId }: { widgetId: string }) => {
	const response = await axios.get<any>(`/widget/${widgetId}`);

	return response.data;
};

export const useGetWidget = (widgetId: string) => {
	const queryKey = [WIDGET_QUERY_KEY, widgetId];

	const { data: response, ...rest } = useQuery(queryKey, () => fetchWidgetInfo({ widgetId }), {
		enabled: Boolean(widgetId),
	});

	const info = useMemo(() => {
		return {
			schema: response?.schema || [],
			values: response?.values || {},
		};
	}, [response]);

	return {
		...rest,
		queryKey,
		...info,
	};
};

const updateWidgetProperties = async ({
	payload,
	widgetId,
}: {
	payload: any;
	widgetId: string;
}) => {
	const response = await workerAxios.put(`/widgets/${widgetId}/`, { property: payload });
	return response.data;
};

export const useUpdateWidgetProperties = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(updateWidgetProperties, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(WIDGET_PREVIEW_QUERY_KEY);
			queryClient.invalidateQueries(APP_STATE_QUERY_KEY);
			queryClient.invalidateQueries(PAGE_DATA_QUERY_KEY);
		},
	});
};

export const useCreateWidget = (props: any = {}) => {
	const queryClient = useQueryClient();
	const toast = useToast();
	const updatePageContext = useSetAtom(pageAtom);

	const mutation = useUpdatePageData({
		...props,
		onSuccess: (data: any) => {
			updatePageContext((old) => ({
				...old,
				widgetName: data?.widget?.id,
			}));

			toast({
				status: 'success',
				title: 'Widget created',
			});
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to create widget',
				description: getErrorMessage(error),
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries(PAGE_DATA_QUERY_KEY);
			queryClient.invalidateQueries(APP_STATE_QUERY_KEY);
		},
	});

	return mutation;
};

const deleteWidget = async ({ widgetId }: any) => {
	const response = await workerAxios.delete(`/widgets/${widgetId}`);

	return response.data;
};

export const useDeleteWidget = (props: any = {}) => {
	const queryClient = useQueryClient();

	return useMutation(deleteWidget, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(PAGE_DATA_QUERY_KEY);
			queryClient.invalidateQueries(APP_STATE_QUERY_KEY);
		},
	});
};
