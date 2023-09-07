import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useMemo } from 'react';

import { axios } from '@/lib/axios';
import { WIDGET_PREVIEW_QUERY_KEY } from '@/features/new-app-preview/hooks';

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
		},
	});
};
