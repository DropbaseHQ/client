import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useMemo } from 'react';

import { axios } from '@/lib/axios';
import { TABLE_DATA_QUERY_KEY } from '@/features/new-smart-table/hooks';
import { COLUMN_PROPERTIES_QUERY_KEY } from '@/features/new-app-builder/hooks';

export const APP_QUERY_KEY = 'table';

const fetchTablePropertiesInfo = async ({ tableId }: { tableId: string }) => {
	const response = await axios.get<any>(`/tables/${tableId}`);

	return response.data;
};

export const useGetTable = (tableId: string, props?: any): any => {
	const queryKey = [APP_QUERY_KEY, tableId];

	const { data: response, ...rest } = useQuery(
		queryKey,
		() => fetchTablePropertiesInfo({ tableId }),
		{
			enabled: Boolean(tableId),
			...(props || {}),
		},
	);

	const info = useMemo(() => {
		return {
			properties: response?.properties || [],
			values: response?.values || {},
		};
	}, [response]);

	return {
		...rest,
		queryKey,
		...info,
	};
};

const updateTableProperties = async ({ payload, tableId }: { payload: any; tableId: string }) => {
	const response = await axios.put(`/tables/${tableId}`, { property: payload });
	return response.data;
};

export const useUpdateTableProperties = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(updateTableProperties, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(TABLE_DATA_QUERY_KEY);
			queryClient.invalidateQueries(COLUMN_PROPERTIES_QUERY_KEY);
		},
	});
};
