import { useQuery } from 'react-query';
import { useMemo } from 'react';

import { axios } from '@/lib/axios';

export const WIDGET_PREVIEW_QUERY_KEY = 'widget/preview';

const fetchWidgetPreview = async ({ widgetId }: { widgetId: string }) => {
	const response = await axios.get<any>(`/widget/ui/${widgetId}`);

	return response.data;
};

export const useGetWidgetPreview = (widgetId: string) => {
	const queryKey = [WIDGET_PREVIEW_QUERY_KEY, widgetId];

	const { data: response, ...rest } = useQuery(queryKey, () => fetchWidgetPreview({ widgetId }), {
		enabled: Boolean(widgetId),
	});

	const info = useMemo(() => {
		return {
			components: response?.components || [],
			widget: response?.widget || {},
		};
	}, [response]);

	return {
		...rest,
		queryKey,
		...info,
	};
};
