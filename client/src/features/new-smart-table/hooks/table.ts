import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { axios, workerAxios } from '@/lib/axios';
import { useGetTable } from '@/features/new-app-builder/hooks';
import { useGetPage } from '@/features/new-page';

export const TABLE_DATA_QUERY_KEY = 'tableData';

const fetchTableData = async ({
	code,
	source,
	type,
	filters,
	sorts,
	appName,
	pageName,
	state,
}: any) => {
	const response = await workerAxios.post<any>(`/query/`, {
		app_name: appName,
		page_name: pageName,
		payload: state,
		table: {
			code,
			type,
			source,
			filters,
			sorts,
		},
	});

	return response.data;
};

export const useTableData = ({
	tableId,
	filters = [],
	sorts = [],
	state,
	appName,
	pageName,
	pageId,
}: any) => {
	const { type, values } = useGetTable(tableId || '');
	const { tables } = useGetPage(pageId);

	const depends = tables.find((t: any) => t.id === tableId)?.depends_on || [];

	const tablesState = state?.state?.tables;

	const dependentTableData = depends.reduce(
		(agg: any, tableName: any) => ({
			...agg,
			[tableName]: tablesState[tableName],
		}),
		{},
	);

	const { code, source } = values || {};

	const queryKey = [
		TABLE_DATA_QUERY_KEY,
		code,
		appName,
		pageName,
		type,
		JSON.stringify({ filters, sorts, dependentTableData }),
	];

	const { data: response, ...rest } = useQuery(
		queryKey,
		() => fetchTableData({ code, source, type, filters, sorts, appName, pageName, state }),
		{
			enabled: !!(code && type && appName && pageName),
		},
	);

	const parsedData: any = useMemo(() => {
		if (response) {
			const header = response?.result?.columns || [];

			const rows: any =
				response?.result?.data?.map((r: any) => {
					return r.reduce((agg: any, item: any, index: any) => {
						return {
							...agg,
							[header?.[index]]: item,
						};
					}, {});
				}) || [];

			return {
				rows,
				header,
				tableName: response.table_name,
				tableId: response.table_id,
			};
		}

		return {
			rows: [],
			header: [],
		};
	}, [response]);

	return {
		...rest,
		...parsedData,
		sqlId: response?.sql_id,
		queryKey,
	};
};

const saveEdits = async ({ tableType, source, edits, code }: any) => {
	const response = await workerAxios.post(`/query/edit_sql_table/`, {
		table: {
			source,
			type: tableType,
			code,
		},
		edits,
	});
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

const fetchTableColumns = async ({ tableId }: { tableId: any }) => {
	const response = await axios.get(`/columns/table/${tableId}`);

	return response.data;
};

export const useTableColumns = (tableId: any) => {
	const queryKey = [TABLE_DATA_QUERY_KEY, 'columns', tableId];
	const { data: response, ...rest } = useQuery(queryKey, () => fetchTableColumns({ tableId }), {
		enabled: !!tableId,
	});

	const columns = useMemo(() => {
		return response || {};
	}, [response]);

	return {
		...rest,
		columns,
	};
};
