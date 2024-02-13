import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { axios, workerAxios } from '@/lib/axios';
import { TABLE_DATA_QUERY_KEY } from '@/features/smart-table/hooks';
import {
	ALL_PAGE_FILES_QUERY_KEY,
	COLUMN_PROPERTIES_QUERY_KEY,
} from '@/features/app-builder/hooks';
import { PAGE_DATA_QUERY_KEY, useGetPage } from '@/features/page';
import { APP_STATE_QUERY_KEY } from '@/features/app-state';
import { WIDGET_PREVIEW_QUERY_KEY } from '@/features/app-preview/hooks';
import { fetchJobStatus } from '@/utils/worker-job';

export const TABLE_QUERY_KEY = 'table';

export const useGetTable = (tableName: string): any => {
	const { appName, pageName } = useParams();
	const { tables, ...rest } = useGetPage({ appName, pageName });
	const table = tables.find((t: any) => t.name === tableName);

	const info = useMemo(() => {
		return {
			...(table || {}),
			type: table?.type,
			filters: (table?.filters || []).map((f: any) => ({
				...f,
				pinned: true,
				id: crypto.randomUUID(),
			})),
			height: table?.height,
			name: table?.name,
			label: table?.label,
			columns: table?.columns || [],
		};
	}, [table]);

	return {
		...rest,
		table,
		...info,
	};
};

export const DATA_FETCHER_QUERY_KEY = 'dataFetchers';

const fetchDataFetchers = async ({ pageId }: any) => {
	const response = await axios.get<any>(`/files/data_fetchers/${pageId}/`);

	return response.data;
};

export const useDataFetchers = (pageId: any) => {
	const queryKey = [DATA_FETCHER_QUERY_KEY, pageId];

	const { data: response, ...rest } = useQuery(queryKey, () => fetchDataFetchers({ pageId }), {
		enabled: Boolean(pageId),
		cacheTime: 0,
		staleTime: 0,
		refetchInterval: 30 * 1000,
	});

	const info = useMemo(() => {
		return {
			fetchers: response || [],
		};
	}, [response]);

	return {
		...rest,
		queryKey,
		...info,
	};
};

const updateTableProperties = async ({
	tableId,
	appName,
	pageName,
	tableName,
	table,
	file,
	pageId,
	state,
	property,
	depends,
}: any) => {
	const response = await workerAxios.put(`/tables/${tableId}/`, {
		app_name: appName,
		page_name: pageName,
		table,
		state,
		file: file || null,
		page_id: pageId,
		table_updates: {
			name: tableName,
			property: property || {},
			file_id: file?.id || null,
			depends_on: depends,
		},
	});

	return response.data;
};

export const useUpdateTableProperties = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(updateTableProperties, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(PAGE_DATA_QUERY_KEY);
			queryClient.invalidateQueries(APP_STATE_QUERY_KEY);
			queryClient.invalidateQueries(COLUMN_PROPERTIES_QUERY_KEY);
		},
	});
};

const convertToSmartTable = async ({ table, state, appName, pageName }: any) => {
	const response = await workerAxios.post(`/tables/convert/`, {
		table,
		state,
		app_name: appName,
		page_name: pageName,
	});

	return response.data;
};

export const useConvertSmartTable = (props: any = {}) => {
	const queryClient = useQueryClient();

	return useMutation(convertToSmartTable, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(PAGE_DATA_QUERY_KEY);
			queryClient.invalidateQueries(APP_STATE_QUERY_KEY);
			queryClient.invalidateQueries(COLUMN_PROPERTIES_QUERY_KEY);
			queryClient.invalidateQueries(TABLE_DATA_QUERY_KEY);
		},
	});
};

const deleteTable = async ({ tableId }: any) => {
	const response = await workerAxios.delete(`/tables/${tableId}`);
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

const runTableQuery = async ({ appName, pageName, pageState, type, fileName }: any) => {
	const response = await workerAxios.post(`/query/run_python/`, {
		app_name: appName,
		page_name: pageName,
		payload: pageState,
		type,
		file_name: fileName,
	});

	return response.data;
};

export const useRunTableQuery = (props: any = {}) => {
	const queryClient = useQueryClient();

	return useMutation(runTableQuery, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(TABLE_DATA_QUERY_KEY);
			queryClient.invalidateQueries(WIDGET_PREVIEW_QUERY_KEY);
		},
	});
};

const runSQLQuery = async ({ appName, pageName, state, source, fileContent }: any) => {
	const response = await workerAxios.post(`/query/sql_string/`, {
		app_name: appName,
		page_name: pageName,
		state,
		source,
		file_content: fileContent,
	});

	if (response.data?.job_id) {
		const jobResponse = await fetchJobStatus(response.data.job_id);
		return jobResponse;
	}
	console.error('No associated job id found');
	throw new Error('Failed to run python function');
};

export const useRunSQLQuery = (props: any = {}) => {
	const queryClient = useQueryClient();

	return useMutation(runSQLQuery, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(WIDGET_PREVIEW_QUERY_KEY);
		},
	});
};

const saveSql = async ({ pageName, appName, fileType, fileName, code, source, depends }: any) => {
	const response = await workerAxios.put(`files/${fileName}`, {
		page_name: pageName,
		app_name: appName,
		file_name: fileName,
		code,
		source,
		type: fileType,
		depends_on: depends,
	});

	return response.data;
};

export const useSaveCode = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(saveSql, {
		onSettled: (_, __, variables: any) => {
			queryClient.invalidateQueries(TABLE_QUERY_KEY);
			queryClient.invalidateQueries([TABLE_DATA_QUERY_KEY, variables?.fileName]);
			queryClient.invalidateQueries(COLUMN_PROPERTIES_QUERY_KEY);
			queryClient.invalidateQueries(ALL_PAGE_FILES_QUERY_KEY);
			queryClient.invalidateQueries(DATA_FETCHER_QUERY_KEY);
			queryClient.invalidateQueries(PAGE_DATA_QUERY_KEY);
		},
		...props,
	});
};
