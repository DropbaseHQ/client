import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useMemo } from 'react';

import { axios } from '@/lib/axios';
import { WIDGET_PREVIEW_QUERY_KEY } from '@/features/new-app-preview/hooks';

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
			schema: response?.schema || [],
			values: response?.values || [],
		};
	}, [response]);

	return {
		...rest,
		queryKey,
		...info,
	};
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
	const response = await axios.put(`/components/${componentId}`, { property: payload, type });
	return response.data;
};

export const useUpdateComponentProperties = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(updateComponentProperties, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(WIDGET_PREVIEW_QUERY_KEY);
		},
	});
};

const createComponents = async ({ widgetId, property, type }: any) => {
	const response = await axios.post(`/components/`, {
		widget_id: widgetId,
		property,
		type,
	});

	return response.data;
};

export const useCreateComponents = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(createComponents, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(WIDGET_PROPERTIES_QUERY_KEY);
		},
	});
};
