import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useAtomValue } from 'jotai';

import { axios, workerAxios } from '@/lib/axios';
import { COLUMN_PROPERTIES_QUERY_KEY, useGetTable } from '@/features/app-builder/hooks';
import { useGetPage } from '@/features/page';
import { APP_STATE_QUERY_KEY, useAppState } from '@/features/app-state';
import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';
import { hasSelectedRowAtom } from '../atoms';

export const TABLE_DATA_QUERY_KEY = 'tableData';

const fetchTableData = async ({
	file,
	appName,
	pageName,
	state,
	filters,
	sorts,
	currentPage,
	pageSize,
}: any) => {
	const response = await workerAxios.post<any>(`/query/`, {
		app_name: appName,
		page_name: pageName,
		file,
		state: state.state,
		filter_sort: {
			filters,
			sorts,
			pagination: {
				page: currentPage || 0,
				page_size: pageSize || 0,
			},
		},
	});

	return response.data;
};

export const useTableData = ({
	tableName,
	filters = [],
	sorts = [],
	state,
	appName,
	pageName,
	currentPage,
	pageSize,
}: any) => {
	const { type, table, isFetching: isLoadingTable } = useGetTable(tableName || '');
	const { tables, files, isFetching: isLoadingPage } = useGetPage({ appName, pageName });
	const { isFetching: isFetchingAppState } = useAppState(appName, pageName);

	const hasSelectedRows = useAtomValue(hasSelectedRowAtom);

	const depends = tables.find((t: any) => t.name === tableName)?.depends_on || [];
	const tablesWithNoSelection = depends.filter((name: any) => !hasSelectedRows[name]);

	const tablesState = state?.state?.tables;

	const dependentTableData = depends.reduce(
		(agg: any, tName: any) => ({
			...agg,
			[tableName]: tablesState[tName],
		}),
		{},
	);

	const { file_id: fileId } = table || {};
	const file = files.find((f: any) => f.id === fileId);

	const queryKey = [
		TABLE_DATA_QUERY_KEY,
		appName,
		pageName,
		type,
		// Prevent table data from being refetched when table is being created or deleted
		// `${Object.keys(state?.state?.tables).length}`,
		currentPage,
		pageSize,
		JSON.stringify({ filters, sorts, dependentTableData, file, table }),
	];

	const { data: response, ...rest } = useQuery(
		queryKey,
		() =>
			fetchTableData({
				appName,
				pageName,
				state,
				file,
				filters,
				sorts,
				currentPage,
				pageSize,
			}),
		{
			enabled: !!(
				!isLoadingTable &&
				!isLoadingPage &&
				!isFetchingAppState &&
				table?.name in tablesState &&
				file &&
				table &&
				appName &&
				pageName &&
				Object.keys(state?.state?.tables || {}).length > 0 &&
				tablesWithNoSelection.length === 0
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
				tableError: response?.result?.error,
			};
		}

		return {
			rows: [],
			header: [],
			tableError: null,
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

const pinFilters = async ({ filters, tableName }: { filters: any; tableName: any }) => {
	const response = await axios.post(`/tables/pin_filters`, { table_id: tableName, filters });
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

const syncDropbaseColumns = async ({ appName, pageName, table, file, state }: any) => {
	const response = await workerAxios.post(`/sync/columns/`, {
		app_name: appName,
		page_name: pageName,
		table,
		file,
		state,
	});
	return response.data;
};

export const useSyncDropbaseColumns = (props: any = {}) => {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation(syncDropbaseColumns, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(TABLE_DATA_QUERY_KEY);
			queryClient.invalidateQueries(COLUMN_PROPERTIES_QUERY_KEY);
		},
		onSuccess: () => {
			queryClient.invalidateQueries(APP_STATE_QUERY_KEY);
		},
		onError: (error: any) => {
			toast({
				title: 'Failed to sync',
				status: 'error',
				description: getErrorMessage(error),
			});
		},
	});
};

const handleReorderTables = async ({ pageId, tables }: any) => {
	const response = await axios.post(`/tables/reorder`, {
		page_id: pageId,
		tables,
	});
	return response.data;
};

export const useReorderTables = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(handleReorderTables, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(TABLE_DATA_QUERY_KEY);
		},
	});
};
