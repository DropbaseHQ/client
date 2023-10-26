import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSetAtom } from 'jotai';
import { useMemo } from 'react';

import { axios } from '@/lib/axios';
import { WIDGET_PREVIEW_QUERY_KEY } from '@/features/app-preview/hooks';
import { PAGE_DATA_QUERY_KEY, pageAtom } from '@/features/page';
import { useToast } from '@/lib/chakra-ui';
import { APP_STATE_QUERY_KEY } from '@/features/app-state';

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
	const response = await axios.put(`/widget/${widgetId}`, { property: payload });
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

const createWidget = async ({ name, pageId }: any) => {
	const response = await axios.post(`/widget/`, {
		name,
		property: {
			name,
			description: '',
			error_message: '',
		},
		page_id: pageId,
	});

	return response.data;
};

export const useCreateWidget = (props: any = {}) => {
	const queryClient = useQueryClient();
	const toast = useToast();
	const updatePageContext = useSetAtom(pageAtom);

	return useMutation(createWidget, {
		...props,
		onSuccess: (data: any) => {
			updatePageContext((old) => ({
				...old,
				widgetId: data.id,
			}));

			toast({
				status: 'success',
				title: 'App created',
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries(PAGE_DATA_QUERY_KEY);
			queryClient.invalidateQueries(APP_STATE_QUERY_KEY);
		},
	});
};
