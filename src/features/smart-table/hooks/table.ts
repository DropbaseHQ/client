import { useEffect, useMemo, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useAtomValue, useSetAtom } from 'jotai';

import { workerAxios } from '@/lib/axios';
import { PAGE_DATA_QUERY_KEY, useGetPage } from '@/features/page';
import { pageStateAtom, useSyncState } from '@/features/app-state';
import { hasSelectedRowAtom } from '../atoms';
import { executeAction } from '@/features/app-preview/hooks';
import { ACTIONS } from '@/constant';
import { DEFAULT_PAGE_SIZE } from '@/features/smart-table/constants';
import { getErrorMessage, getLogInfo } from '@/utils';
import { useToast } from '@/lib/chakra-ui';
import { logsAtom } from '@/features/app-builder/atoms';

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

export const useTableData = ({
	tableName,
	appName,
	pageName,
	currentPage = 0,
	pageSize = DEFAULT_PAGE_SIZE,
}: any) => {
	const {
		tables,
		files,
		isFetching: isLoadingPage,
		availableMethods: allResourceMethods,
	} = useGetPage({ appName, pageName });

	const toast = useToast();

	const setLogs = useSetAtom(logsAtom);

	const tableMethods = allResourceMethods?.[tableName]?.methods || [];

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

	// TODO: delete
	const depends = files.find((f: any) => f.name === table?.fetcher?.value)?.depends_on || [];
	const tablesWithNoSelection = depends.filter((name: any) => !hasSelectedRows[name]);

	const queryKey = [
		TABLE_DATA_QUERY_KEY,
		tableName,
		appName,
		pageName,
		table?.type,
		currentPage,
		pageSize,
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
					pagination: {
						page: currentPage || 0,
						page_size: pageSize || 0,
					},
				},
			}),
		{
			enabled: !!(
				!isLoadingPage &&
				tableMethods?.includes(ACTIONS.GET_DATA) &&
				table?.name in pageState &&
				table &&
				appName &&
				pageName &&
				Object.keys(pageState || {}).length > 0 &&
				tablesWithNoSelection.length === 0
			),
			staleTime: Infinity,
			onSuccess: (data: any) => {
				// console.log('table data', data);
				syncState(data);

				setLogs({
					...getLogInfo({ info: data }),
					meta: {
						type: 'table',
						action: 'get',
						resource: tableName,
						state: pageStateRef.current,
					},
				});
			},
			retry: false,
			onError: (error: any) => {
				if (error) {
					toast({
						status: 'error',
						title: getErrorMessage(error),
					});
				}

				setLogs({
					...getLogInfo({ info: error, isError: true }),
					meta: {
						type: 'table',
						action: 'get',
						resource: tableName,
						state: pageStateRef.current,
					},
				});

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
								[tName]: {
									...(agg?.[tName] || {}),
									columns: Object.keys(old?.[tName] || {}).reduce(
										(acc: { [col: string]: string | null }, curr: string) => ({
											...acc,
											[curr]: null,
										}),
										{},
									),
								},
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

	// TODO: watch out for reseting of context
	useEffect(() => {
		syncState(response);
	}, [response, syncState]);

	return {
		...rest,
		sqlId: response?.sql_id,
		queryKey,
	};
};

const saveEdits = async ({ appName, pageName, resource, state, rowEdits }: any) => {
	const response = await executeAction({
		appName,
		pageName,
		resource,
		action: ACTIONS.UPDATE_ROW,
		pageState: state,
		rowEdits,
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

const addRow = async ({ appName, pageName, resource, state, row }: any) => {
	const response = await executeAction({
		appName,
		pageName,
		resource,
		action: ACTIONS.ADD_ROW,
		pageState: state,
		row,
	});

	return response.data;
};

export const useAddRow = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(addRow, {
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
