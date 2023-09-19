import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { axios } from '@/lib/axios';
import { COLUMN_PROPERTIES_QUERY_KEY } from '@/features/new-app-builder/hooks';

export const TABLE_DATA_QUERY_KEY = 'tableData';

const fetchTableData = async ({ tableId, filters, sorts }: any) => {
	const response = await axios.post<any>(`/tables/query`, {
		table_id: tableId,
		filters,
		sorts,
	});

	return response.data;
};

export const useTableData = ({ tableId, filters = [], sorts = [] }: any) => {
	const queryKey = [TABLE_DATA_QUERY_KEY, tableId, JSON.stringify({ filters, sorts })];

	const { data: response, ...rest } = useQuery(
		queryKey,
		() => fetchTableData({ tableId, filters, sorts }),
		{
			enabled: !!tableId,
		},
	);

	const parsedData: any = useMemo(() => {
		if (response && response.data) {
			const rows: any = response.data.map((r: any) => {
				return r.reduce((agg: any, item: any, index: any) => {
					return {
						...agg,
						[response.header[index]]: item,
					};
				}, {});
			});

			return {
				rows,
				columns: response.columns,
				header: response.header,
				tableName: response.table_name,
				tableId: response.table_id,
			};
		}

		return {
			rows: [],
			header: [],
			columns: {},
		};
	}, [response]);

	return {
		...rest,
		...parsedData,
		sqlId: response?.sql_id,
		queryKey,
	};
};

const convertToSmartTable = async ({ tableId }: any) => {
	const response = await axios.post(`/tables/convert`, {
		table_id: tableId,
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
		},
	});
};

const saveEdits = async ({ edits, tableId }: { edits: any; tableId: any }) => {
	const response = await axios.post(`/task/edit`, { table_id: tableId, edits });
	return response.data;
};

export const useSaveEdits = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(saveEdits, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(TABLE_DATA_QUERY_KEY);
		},
	});
};

const pinFilters = async ({ filters, tableId }: { filters: any; tableId: any }) => {
	const response = await axios.post(`/tables/pin_filters`, { table_id: tableId, filters });
	return response.data;
};

export const usePinFilters = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(pinFilters, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(TABLE_DATA_QUERY_KEY);
		},
	});
};
