import { useEffect, useMemo, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useAtomValue, useSetAtom } from 'jotai';
import { useDebounce } from 'use-debounce';

import { workerAxios } from '@/lib/axios';
import { COLUMN_PROPERTIES_QUERY_KEY } from '@/features/app-builder/hooks';
import { PAGE_DATA_QUERY_KEY, useGetPage } from '@/features/page';
import { pageStateAtom, useSyncState } from '@/features/app-state';
import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';
import { hasSelectedRowAtom } from '../atoms';
import { executeAction } from '@/features/app-preview/hooks';
import { ACTIONS } from '@/constant';

export const TABLE_DATA_QUERY_KEY = 'tableData';
export const FUNCTION_DATA_QUERY_KEY = 'functionData';

const fetchFunctionData = async ({ appName, pageName, tableName, state }: any) => {
	const response = await executeAction({
		pageName,
		appName,
		pageState: state,
		action: ACTIONS.GET_DATA,
		resource: tableName,
	});

	return response;
};

export const useParsedData: any = (response: any, table: any) => {
	return useMemo(() => {
		if (response) {
			const customColumns = table?.columns?.filter(
				(c: any) => c.column_type === 'button_column' && !c?.hidden,
			);

			const header = [...(response?.columns || []), ...(customColumns || [])];

			const rows: any =
				response?.data?.map((r: any) => {
					return r.reduce((agg: any, item: any, index: any) => {
						return {
							...agg,
							[header?.[index]?.name]: item,
						};
					}, {});
				}) || [];

			return {
				rows,
				header,
				tableName: response.table_name,
				tableError: response?.error,
			};
		}

		return {
			rows: [],
			header: [],
			tableError: null,
		};
	}, [response, table]);
};

export const useFetcherData = ({ fetcher, appName, pageName }: any) => {
	const pageState: any = useAtomValue(pageStateAtom);
	const pageStateRef = useRef(pageState);
	pageStateRef.current = pageState;

	const queryKey = [FUNCTION_DATA_QUERY_KEY, fetcher, appName, pageName];

	const { data: response, ...rest } = useQuery(
		queryKey,
		() =>
			fetchFunctionData({
				fetcher,
				appName,
				pageName,
				state: pageStateRef.current,
			}),
		{
			enabled: !!fetcher,
			staleTime: Infinity,
		},
	);

	const parsedData = useParsedData(response);

	return {
		...rest,
		...parsedData,
		sqlId: response?.sql_id,
		queryKey,
	};
};

export const useTableData = ({
	tableName,
	filters = [],
	sorts = [],
	appName,
	pageName,
	currentPage,
	pageSize,
}: any) => {
	const { tables, files, isFetching: isLoadingPage } = useGetPage({ appName, pageName });

	const [debouncedFilters] = useDebounce(filters, 1000);

	const selectRow = useSetAtom(pageStateAtom);

	const pageState: any = useAtomValue(pageStateAtom);
	const pageStateRef = useRef(pageState);
	pageStateRef.current = pageState;

	const table = tables.find((t: any) => t.name === tableName);

	const hasSelectedRows = useAtomValue(hasSelectedRowAtom);

	const filesWithCurrentTableAsDependency = (files || [])
		.filter((f: any) => f?.depends_on?.includes(tableName))
		.map((f: any) => f.name);

	const tablesWhichDependsOnCurrent = tables
		?.filter((t: any) => filesWithCurrentTableAsDependency?.includes(t?.fetcher?.value))
		?.map((t: any) => t?.name);

	const depends = files.find((f: any) => f.name === table?.fetcher?.value)?.depends_on || [];
	const tablesWithNoSelection = depends.filter((name: any) => !hasSelectedRows[name]);

	const dependentTableData = depends.reduce(
		(agg: any, tName: any) => ({
			...agg,
			[tName]: pageState[tName],
		}),
		{},
	);

	const queryKey = [
		TABLE_DATA_QUERY_KEY,
		tableName,
		appName,
		pageName,
		table?.type,
		currentPage,
		pageSize,
		JSON.stringify({ debouncedFilters, sorts, dependentTableData }),
	];

	const syncState = useSyncState();

	const { data: response, ...rest } = useQuery(
		queryKey,
		() =>
			fetchFunctionData({
				appName,
				pageName,
				tableName,
				state: pageStateRef.current,
				fetcher: table?.fetcher,
				filter_sort: {
					filters,
					sorts,
					pagination: {
						page: currentPage || 0,
						page_size: pageSize || 0,
					},
				},
			}),
		{
			enabled: !!(
				!isLoadingPage &&
				table?.name in pageState &&
				table &&
				appName &&
				pageName &&
				Object.keys(pageState || {}).length > 0 &&
				tablesWithNoSelection.length === 0
			),
			staleTime: Infinity,
			onError: () => {
				/**
				 * Reset selected row of the current table, and all the tables
				 * which depends on the current table.
				 */
				if (tablesWhichDependsOnCurrent?.length > 0) {
					selectRow((old: any) => {
						const baseStateForSelectedRow = [
							...tablesWhichDependsOnCurrent,
							tableName,
						].reduce((agg: any, tName: any) => {
							return {
								...agg,
								[tName]: Object.keys(old?.[tName] || {}).reduce(
									(acc: { [col: string]: string | null }, curr: string) => ({
										...acc,
										[curr]: null,
									}),
									{},
								),
							};
						}, {});

						return {
							...old,
							...baseStateForSelectedRow,
						};
					});
				}
			},
		},
	);

	useEffect(() => {
		syncState(response);
	}, [response, syncState]);

	return {
		...rest,
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

const saveColumns = async ({ appName, pageName, tableName, columns }: any) => {
	const response = await workerAxios.post(`/page/save_table_columns/`, {
		app_name: appName,
		page_name: pageName,
		table_name: tableName,
		columns,
	});

	return response.data;
};

export const useSaveColumns = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(saveColumns, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(TABLE_DATA_QUERY_KEY);
			queryClient.invalidateQueries(PAGE_DATA_QUERY_KEY);
		},
	});
};

const pinFilters = async ({ filters, tableName }: { filters: any; tableName: any }) => {
	const response = await workerAxios.post(`/tables/pin_filters`, {
		table_id: tableName,
		filters,
	});
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

// TODO: @yash-dropbase please review, removed from backend
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
			queryClient.invalidateQueries(PAGE_DATA_QUERY_KEY);
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
	const response = await workerAxios.post(`/tables/reorder`, {
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
