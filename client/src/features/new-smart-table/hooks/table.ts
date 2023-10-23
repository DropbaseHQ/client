import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { axios, workerAxios } from '@/lib/axios';
import { useGetTable } from '@/features/new-app-builder/hooks';

export const TABLE_DATA_QUERY_KEY = 'tableData';

const fetchTableData = async ({ code, source, type, filters, sorts, appName, pageName, state }: any) => {
	const response = await workerAxios.post<any>(`/query/`, {
		app_name: appName,
		page_name: pageName,
		payload: state,
		table: {
			code,
			type,
			source,
			filters,
			sorts
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
}: any) => {
	const { type, values } = useGetTable(tableId || '');

	const { code, source } = values || {};

	const queryKey = [
		TABLE_DATA_QUERY_KEY,
		code,
		appName,
		pageName,
		type,
		JSON.stringify({ filters, sorts, state }),
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

			const columns = header.reduce(
				(agg: any, colName: any) => ({
					...agg,
					[colName]: { name: colName, visible: true },
				}),
				{},
			);

			return {
				rows,
				columns,
				header,
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
