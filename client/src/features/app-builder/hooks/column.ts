import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useMemo } from 'react';

import { axios } from '@/lib/axios';
import { TABLE_DATA_QUERY_KEY } from '@/features/smart-table/hooks';
import { PAGE_DATA_QUERY_KEY } from '@/features/page';

export const COLUMN_PROPERTIES_QUERY_KEY = 'column/properties';

const fetchTableColumnProperties = async ({ tableId }: { tableId: string }) => {
	const response = await axios.get<any>(`/columns/table/${tableId}`);

	return response.data;
};

export const useGetColumnProperties = (tableId: string, props: any = {}) => {
	const queryKey = [COLUMN_PROPERTIES_QUERY_KEY, tableId];

	const { data: response, ...rest } = useQuery(
		queryKey,
		() => fetchTableColumnProperties({ tableId }),
		{
			enabled: Boolean(tableId),
			...props,
		},
	);

	const info = useMemo(() => {
		return {
			schema: response?.schema || [],
			values: response?.columns || [],
			columns: (response?.columns || []).reduce(
				(agg: any, col: any) => ({
					...agg,
					[col.name]: col.property || {},
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

const updateColumnProperties = async ({
	payload,
	columnId,
	type,
}: {
	payload: any;
	columnId: string;
	type: any;
}) => {
	const response = await axios.put(`/columns/${columnId}`, { property: payload, type });
	return response.data;
};

export const useUpdateColumnProperties = (props: any = {}) => {
	const queryClient = useQueryClient();

	return useMutation(updateColumnProperties, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(TABLE_DATA_QUERY_KEY);
			queryClient.invalidateQueries(PAGE_DATA_QUERY_KEY);
		},
	});
};
