import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useMemo } from 'react';

import { axios, workerAxios } from '@/lib/axios';
import { TABLE_DATA_QUERY_KEY } from '@/features/smart-table/hooks';
import { COLUMN_PROPERTIES_QUERY_KEY } from '@/features/app-builder/hooks';
import { PAGE_DATA_QUERY_KEY } from '@/features/page';
import { APP_STATE_QUERY_KEY } from '@/features/app-state';
import { WIDGET_PREVIEW_QUERY_KEY } from '@/features/app-preview/hooks';

export const TABLE_QUERY_KEY = 'table';

const fetchTablePropertiesInfo = async ({ tableId }: { tableId: string }) => {
	const response = await axios.get<any>(`/tables/${tableId}`);

	return response.data;
};

export const useGetTable = (tableId: string, props?: any): any => {
	const queryKey = [TABLE_QUERY_KEY, tableId];

	const { data: response, ...rest } = useQuery(
		queryKey,
		() => fetchTablePropertiesInfo({ tableId }),
		{
			enabled: Boolean(tableId),
			...(props || {}),
		},
	);

	const info = useMemo(() => {
		return {
			properties: response?.properties || [],
			values: response?.values || {},
			sourceId: response?.source_id,
			type: response?.type,
		};
	}, [response]);

	return {
		...rest,
		queryKey,
		...info,
	};
};

export const QUERY_NAMES_KEY = 'queryFetcher';

const fetchQueryNames = async ({ pageName, appName }: any) => {
	const response = await workerAxios.get<any>(`/files/table_options/${appName}/${pageName}/`);

	return response.data;
};

export const useQueryNames = ({ pageName, appName }: any) => {
	const queryKey = [QUERY_NAMES_KEY, pageName, appName];

	const { data: response, ...rest } = useQuery(
		queryKey,
		() => fetchQueryNames({ pageName, appName }),
		{
			enabled: Boolean(pageName && appName),
		},
	);

	const info = useMemo(() => {
		return {
			queryNames: {
				sql: response?.sql || [],
				python: response?.python || [],
			},
		};
	}, [response]);

	return {
		...rest,
		queryKey,
		...info,
	};
};

const createTable = async ({ property, pageId, sourceId }: any) => {
	const response = await axios.post(`/tables/`, {
		property,
		page_id: pageId,
		source_id: sourceId,
		type: 'sql',
		state: {},
	});
	return response.data;
};

export const useCreateTable = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(createTable, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(PAGE_DATA_QUERY_KEY);
			queryClient.invalidateQueries(APP_STATE_QUERY_KEY);
		},
	});
};

const updateTableProperties = async ({
	payload,
	tableId,
	sourceId,
	pageId,
	name,
	type,
	appName,
	pageName,
	token,
}: {
	payload: any;
	tableId: string;
	sourceId: string;
	pageId: any;
	name: string;
	type: any;
	appName: any;
	pageName: any;
	token: any;
}) => {
	const response = await axios.put(`/tables/${tableId}`, {
		name,
		property: payload,
		source_id: sourceId,
		page_id: pageId,
		type,
		app_name: appName,
		page_name: pageName,
		token,
	});

	return response.data;
};

export const useUpdateTableProperties = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(updateTableProperties, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(TABLE_DATA_QUERY_KEY);
			queryClient.invalidateQueries(APP_STATE_QUERY_KEY);
			queryClient.invalidateQueries(PAGE_DATA_QUERY_KEY);
			queryClient.invalidateQueries(COLUMN_PROPERTIES_QUERY_KEY);
		},
	});
};

const convertToSmartTable = async ({ tableId, state }: any) => {
	const response = await axios.post(`/tables/convert`, {
		table_id: tableId,
		state,
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
			queryClient.invalidateQueries(APP_STATE_QUERY_KEY);
		},
	});
};

const deleteTable = async ({ tableId }: any) => {
	const response = await axios.delete(`/tables/${tableId}`);
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
	console.log('here')
	const response = await workerAxios.post(`/query/run_sql_string/`, {
		app_name: appName,
		page_name: pageName,
		state,
		source,
		file_content: fileContent,
	});

	return response.data;
};

export const useRunSQLQuery = (props: any = {}) => {
	const queryClient = useQueryClient();

	return useMutation(runSQLQuery, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(TABLE_DATA_QUERY_KEY);
			queryClient.invalidateQueries(WIDGET_PREVIEW_QUERY_KEY);
		},
	});
};

const saveSql = async ({ pageName, appName, fileName, sql }: any) => {
	const response = await workerAxios.post(`files/save_sql/`, {
		page_name: pageName,
		app_name: appName,
		file_name: fileName,
		sql,
	});

	return response.data;
};

export const useSaveSql = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(saveSql, {
		onSettled: () => {
			queryClient.invalidateQueries(TABLE_DATA_QUERY_KEY);
		},
		...props,
	});
};
