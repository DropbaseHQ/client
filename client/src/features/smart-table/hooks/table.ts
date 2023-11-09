import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { axios, workerAxios } from '@/lib/axios';
import { COLUMN_PROPERTIES_QUERY_KEY, useGetTable } from '@/features/app-builder/hooks';
import { useGetPage } from '@/features/page';

export const TABLE_DATA_QUERY_KEY = 'tableData';

const fetchTableData = async ({ file, appName, pageName, state }: any) => {
	const response = await workerAxios.post<any>(`/query/`, {
		app_name: appName,
		page_name: pageName,
		file,
		state: state.state,
		filter_sort: { filters: [], sorts: [] },
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
	const { type, table, isLoading: isLoadingTable } = useGetTable(tableId || '');
	const { tables, files, isLoading: isLoadingPage } = useGetPage(pageId);

	const depends = tables.find((t: any) => t.id === tableId)?.depends_on || [];

	const tablesState = state?.state?.tables;

	const dependentTableData = depends.reduce(
		(agg: any, tableName: any) => ({
			...agg,
			[tableName]: tablesState[tableName],
		}),
		{},
	);

	const { file_id: fileId } = table || {};
	const file = files.find((f: any) => f.id === fileId);

	const queryKey = [
		TABLE_DATA_QUERY_KEY,
		appName,
		pageName,
		state?.state?.tables,
		type,
		JSON.stringify({ filters, sorts, dependentTableData, file, table }),
	];

	const { data: response, ...rest } = useQuery(
		queryKey,
		() => fetchTableData({ appName, pageName, state, file }),
		{
			enabled: !!(
				!isLoadingTable &&
				!isLoadingPage &&
				file &&
				table &&
				appName &&
				pageName &&
				Object.keys(state?.state?.tables || {}).length > 0
			),
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

const saveEdits = async ({ file, edits }: any) => {
	const response = await workerAxios.post(`/edit_cell/edit_sql_table/`, {
		file,
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

const syncDropbaseColumns = async ({ appName, pageName, tables, state }: any) => {
	const response = await workerAxios.post(`/sync/columns/`, {
		app_name: appName,
		page_name: pageName,
		tables,
		state,
	});
	return response.data;
};

export const useSyncDropbaseColumns = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(syncDropbaseColumns, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(TABLE_DATA_QUERY_KEY);
			queryClient.invalidateQueries(COLUMN_PROPERTIES_QUERY_KEY);
		},
	});
};
