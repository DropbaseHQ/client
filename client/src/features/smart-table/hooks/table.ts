import { useMemo, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useAtomValue, useSetAtom } from 'jotai';
import { useDebounce } from 'use-debounce';

import { axios, workerAxios } from '@/lib/axios';
import { COLUMN_PROPERTIES_QUERY_KEY } from '@/features/app-builder/hooks';
import { PAGE_DATA_QUERY_KEY, useGetPage } from '@/features/page';
import { pageStateAtom, pageStateContextAtom } from '@/features/app-state';
import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';
import { hasSelectedRowAtom } from '../atoms';
import { fetchJobStatus } from '@/utils/worker-job';

export const TABLE_DATA_QUERY_KEY = 'tableData';
export const FUNCTION_DATA_QUERY_KEY = 'functionData';

const fetchFunctionData = async ({
	fetcher,
	appName,
	pageName,
	state,
	filter_sort = null,
}: any) => {
	const response = await workerAxios.post<any>(`/query/`, {
		fetcher,
		app_name: appName,
		page_name: pageName,
		state: state.state,
		filter_sort,
	});

	if (response.data?.job_id) {
		const jobResponse = await fetchJobStatus(response.data.job_id);
		return jobResponse;
	}

	throw new Error('Failed to retrieve data from fetcher');
};

const useParsedData: any = (response: any, table: any) =>
	useMemo(() => {
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

	const pageStateContext: any = useAtomValue(pageStateContextAtom);
	const pageStateRef = useRef(pageStateContext);
	pageStateRef.current = pageStateContext;

	const table = tables.find((t: any) => t.name === tableName);

	const hasSelectedRows = useAtomValue(hasSelectedRowAtom);

	const filesWithCurrentTableAsDependency = (files || [])
		.filter((f: any) => f?.depends_on?.includes(tableName))
		.map((f: any) => f.name);

	const tablesWhichDependsOnCurrent = tables
		?.filter((t: any) => filesWithCurrentTableAsDependency?.includes(t?.fetcher))
		?.map((t: any) => t?.name);

	const depends = files.find((f: any) => f.name === table?.fetcher)?.depends_on || [];
	const tablesWithNoSelection = depends.filter((name: any) => !hasSelectedRows[name]);

	const tablesState = pageStateContext?.state;

	const dependentTableData = depends.reduce(
		(agg: any, tName: any) => ({
			...agg,
			[tName]: tablesState[tName],
		}),
		{},
	);

	const queryKey = [
		TABLE_DATA_QUERY_KEY,
		table?.fetcher,
		tableName,
		appName,
		pageName,
		table?.type,
		currentPage,
		pageSize,
		JSON.stringify({ debouncedFilters, sorts, dependentTableData }),
	];

	const { data: response, ...rest } = useQuery(
		queryKey,
		() =>
			fetchFunctionData({
				appName,
				pageName,
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
				table?.name in tablesState &&
				table?.fetcher &&
				table &&
				appName &&
				pageName &&
				Object.keys(pageStateContext?.state || {}).length > 0 &&
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

	const parsedData = useParsedData(response, table);

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
