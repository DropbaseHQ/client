import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useMemo } from 'react';
import pureAxios from 'axios';

import { axios, workerAxios } from '@/lib/axios';
import { WIDGET_PREVIEW_QUERY_KEY } from '@/features/new-app-preview/hooks';
import { PAGE_DATA_QUERY_KEY } from '@/features/new-page';

export const ALL_PAGE_FUNCTIONS_QUERY_KEY = 'functions';

const fetchAllPageFunctions = async ({
	pageName,
	appName,
}: {
	pageName: string;
	appName: string;
}) => {
	const response = await workerAxios.get<{ files: string[] }>(
		`/files/python/${appName}/${pageName}`,
	);

	return response.data;
};

export const usePageFunctions = ({ pageName, appName }: { pageName: string; appName: string }) => {
	const queryKey = [ALL_PAGE_FUNCTIONS_QUERY_KEY, pageName, appName];

	const { data: response, ...rest } = useQuery(
		queryKey,
		() => fetchAllPageFunctions({ pageName, appName }),
		{
			enabled: Boolean(appName) && Boolean(pageName),
		},
	);

	const info = useMemo(() => {
		return {
			functions: response?.files || [],
		};
	}, [response]);

	return {
		...rest,
		queryKey,
		...info,
	};
};

export const ALL_PAGE_FUNCTIONS_NAMES_QUERY_KEY = 'functionNames';

const fetchAllPageFunctionNames = async ({ appName, pageName }: any) => {
	const response = await workerAxios.get<any>(`files/functions/${appName}/${pageName}/context`);

	return response.data;
};

export const useAllPageFunctionNames = ({ appName, pageName }: any) => {
	const queryKey = [ALL_PAGE_FUNCTIONS_NAMES_QUERY_KEY, appName, pageName];

	const { data: response, ...rest } = useQuery(
		queryKey,
		() => fetchAllPageFunctionNames({ appName, pageName }),
		{
			enabled: Boolean(pageName && appName),
		},
	);

	const info = useMemo(() => {
		return {
			functions: response?.files || [],
		};
	}, [response]);

	return {
		...rest,
		queryKey,
		...info,
	};
};

const fetchPageFunction = async ({ functionName, appName, pageName }: any) => {
	const response = await workerAxios.get<string>(
		`/workspace/${appName}/${pageName}/scripts/${functionName}`,
	);

	return response.data;
};

export const usePageFunction = ({ functionName, appName, pageName }: any) => {
	const queryKey = [ALL_PAGE_FUNCTIONS_QUERY_KEY, functionName, appName, pageName];

	const { data: response, ...rest } = useQuery(
		queryKey,
		() => fetchPageFunction({ functionName, appName, pageName }),
		{
			enabled: Boolean(functionName && appName && pageName),
		},
	);

	const info = useMemo(() => {
		return {
			code: response || '',
		};
	}, [response]);

	return {
		...rest,
		queryKey,
		...info,
	};
};

const updateFunction = async ({
	code,
	functionId,
	name,
}: {
	code: any;
	functionId: string;
	name: string;
}) => {
	const response = await axios.put(`/functions/${functionId}`, { code, name });

	return response.data;
};

export const useUpdateFunction = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(updateFunction, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(WIDGET_PREVIEW_QUERY_KEY);
			queryClient.invalidateQueries(ALL_PAGE_FUNCTIONS_NAMES_QUERY_KEY);
			queryClient.invalidateQueries(PAGE_DATA_QUERY_KEY);
		},
	});
};

const createFunction = async ({ pageId, name }: any) => {
	const response = await pureAxios.post(
		`${import.meta.env.VITE_WORKER_API_ENDPOINT}/functions/`,
		{
			page_id: pageId,
			name,
			code: 'def action() -> State:\n    # your code goes here\n    return state',
			type: 'python',
		},
	);

	return response.data;
};

export const useCreateFunction = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(createFunction, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(ALL_PAGE_FUNCTIONS_QUERY_KEY);
			queryClient.invalidateQueries(PAGE_DATA_QUERY_KEY);
			queryClient.invalidateQueries(ALL_PAGE_FUNCTIONS_NAMES_QUERY_KEY);
		},
	});
};

const runFunction = async ({ testCode, pageId, pageState, functionId, code }: any) => {
	const response = await axios.post(`/task/`, {
		page_id: pageId,
		function_id: functionId,
		test_code: testCode,
		state: pageState,
		code,
	});

	return response.data;
};

export const useRunFunction = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(runFunction, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(WIDGET_PREVIEW_QUERY_KEY);
			queryClient.invalidateQueries(ALL_PAGE_FUNCTIONS_NAMES_QUERY_KEY);
		},
	});
};

const deleteFunction = async ({ functionId }: any) => {
	const response = await axios.delete(`/functions/${functionId}`);

	return response.data;
};

export const useDeleteFunction = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(deleteFunction, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(ALL_PAGE_FUNCTIONS_QUERY_KEY);
			queryClient.invalidateQueries(PAGE_DATA_QUERY_KEY);
			queryClient.invalidateQueries(ALL_PAGE_FUNCTIONS_NAMES_QUERY_KEY);
		},
	});
};
