import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useMemo } from 'react';

import { axios } from '@/lib/axios';
import { WIDGET_PREVIEW_QUERY_KEY } from '@/features/new-app-preview/hooks';

export const ALL_PAGE_FUNCTIONS_QUERY_KEY = 'functions';

const fetchAllPageFunctions = async ({ pageId }: { pageId: string }) => {
	const response = await axios.get<any>(`/functions/page/${pageId}`);

	return response.data;
};

export const usePageFunctions = (pageId: string) => {
	const queryKey = [ALL_PAGE_FUNCTIONS_QUERY_KEY, pageId];

	const { data: response, ...rest } = useQuery(
		queryKey,
		() => fetchAllPageFunctions({ pageId }),
		{
			enabled: Boolean(pageId),
		},
	);

	const info = useMemo(() => {
		return {
			functions: response || [],
		};
	}, [response]);

	return {
		...rest,
		queryKey,
		...info,
	};
};

const fetchPageFunction = async ({ functionId }: { functionId: string }) => {
	const response = await axios.get<any>(`/functions/${functionId}`);

	return response.data;
};

export const usePageFunction = (functionId: string) => {
	const queryKey = [ALL_PAGE_FUNCTIONS_QUERY_KEY, functionId];

	const { data: response, ...rest } = useQuery(
		queryKey,
		() => fetchPageFunction({ functionId }),
		{
			enabled: Boolean(functionId),
		},
	);

	const info = useMemo(() => {
		return {
			...(response || {}),
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
		},
	});
};

const createFunction = async ({ pageId, name }: any) => {
	const response = await axios.post(`/functions/`, {
		page_id: pageId,
		name,
		code: '',
		type: 'python',
	});

	return response.data;
};

export const useCreateFunction = (props: any = {}) => {
	const queryClient = useQueryClient();
	return useMutation(createFunction, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(ALL_PAGE_FUNCTIONS_QUERY_KEY);
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
		},
	});
};
