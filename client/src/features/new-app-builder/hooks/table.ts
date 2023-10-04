import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useMemo } from 'react';

import { axios } from '@/lib/axios';
import { TABLE_DATA_QUERY_KEY } from '@/features/new-smart-table/hooks';
import { COLUMN_PROPERTIES_QUERY_KEY } from '@/features/new-app-builder/hooks';
import { PAGE_DATA_QUERY_KEY } from '@/features/new-page';
import { APP_STATE_QUERY_KEY } from '@/features/new-app-state';

export const TABLE_QUERY_KEY = 'table';

const fetchTablePropertiesInfo = async ({ tableId }: { tableId: string }) => {
	const response = await axios.get<any>(`/tables/${tableId}`);

	return response.data;
};

export const useGetTable = (tableId: string, props?: any): any => {
	const queryKey = [TABLE_QUERY_KEY, tableId];

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
			sourceId: response?.source_id,
		};
	}, [response]);

	return {
		...rest,
		queryKey,
		...info,
	};
};

const createTable = async ({ property, pageId, sourceId }: any) => {
	const response = await axios.post(`/tables/`, {
		property,
		page_id: pageId,
		source_id: sourceId,
		type: 'postgres',
		state: {},
	});
	return response.data;
};

export const useCreateTable = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(createTable, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(PAGE_DATA_QUERY_KEY);
			queryClient.invalidateQueries(APP_STATE_QUERY_KEY);
		},
	});
};

const updateTableProperties = async ({
	payload,
	tableId,
	sourceId,
	state,
	pageId,
}: {
	payload: any;
	tableId: string;
	sourceId: string;
	state: any;
	pageId: any;
}) => {
	const response = await axios.put(`/tables/${tableId}`, {
		property: payload,
		source_id: sourceId,
		state,
		page_id: pageId,
	});

	return response.data;
};

export const useUpdateTableProperties = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(updateTableProperties, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(TABLE_DATA_QUERY_KEY);
			queryClient.invalidateQueries(APP_STATE_QUERY_KEY);
			queryClient.invalidateQueries(PAGE_DATA_QUERY_KEY);
			queryClient.invalidateQueries(COLUMN_PROPERTIES_QUERY_KEY);
		},
	});
};

const convertToSmartTable = async ({ tableId, state }: any) => {
	const response = await axios.post(`/tables/convert`, {
		table_id: tableId,
		state,
	});

	return response.data;
};

export const useConvertSmartTable = (props: any = {}) => {
	const queryClient = useQueryClient();

	return useMutation(convertToSmartTable, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(TABLE_DATA_QUERY_KEY);
			queryClient.invalidateQueries(COLUMN_PROPERTIES_QUERY_KEY);
			queryClient.invalidateQueries(APP_STATE_QUERY_KEY);
		},
	});
};

const deleteTable = async ({ tableId }: any) => {
	const response = await axios.delete(`/tables/${tableId}`);
	return response.data;
};

export const useDeleteTable = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(deleteTable, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(PAGE_DATA_QUERY_KEY);
			queryClient.invalidateQueries(APP_STATE_QUERY_KEY);
		},
	});
};
