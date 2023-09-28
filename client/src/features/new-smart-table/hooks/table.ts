import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { axios } from '@/lib/axios';
import { useGetPage } from '@/features/new-page';

export const TABLE_DATA_QUERY_KEY = 'tableData';

const fetchTableData = async ({ tableId, filters, sorts, state, pageId }: any) => {
	const response = await axios.post<any>(`/tables/query`, {
		table_id: tableId,
		filters,
		sorts,
		state,
		page_id: pageId,
	});

	return response.data;
};

export const useTableData = ({ tableId, pageId, filters = [], sorts = [], state }: any) => {
	const { tables } = useGetPage(pageId);

	const depends = tables.find((t: any) => t.id === tableId)?.depends_on || [];
	const tablesState = state.tables;

	const dependentTableData = depends.reduce(
		(agg: any, tableName: any) => ({
			...agg,
			[tableName]: tablesState[tableName],
		}),
		{},
	);

	const queryKey = [
		TABLE_DATA_QUERY_KEY,
		tableId,
		JSON.stringify({ filters, sorts, dependentTableData, pageId }),
	];

	const { data: response, ...rest } = useQuery(
		queryKey,
		() => fetchTableData({ tableId, filters, sorts, state: tablesState, pageId }),
		{
			enabled: !!(tableId && Object.keys(state?.tables || {}).length > 0),
		},
	);

	const parsedData: any = useMemo(() => {
		if (response) {
			const rows: any =
				response?.data?.map((r: any) => {
					return r.reduce((agg: any, item: any, index: any) => {
						return {
							...agg,
							[response?.header?.[index]]: item,
						};
					}, {});
				}) || [];

			return {
				rows,
				columns: response.columns || {},
				header: response.header || [],
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
