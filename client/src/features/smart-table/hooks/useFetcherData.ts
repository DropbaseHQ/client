import { useMemo, useRef } from 'react';
import { useQuery } from 'react-query';
import { useAtomValue } from 'jotai';

import { workerAxios } from '@/lib/axios';
import { newPageStateAtom } from '@/features/app-state';
import { fetchJobStatus } from '@/utils/worker-job';

export const TABLE_DATA_QUERY_KEY = 'tableData';

const fetchFunctionData = async ({ fetcher, appName, pageName, state }: any) => {
	const response = await workerAxios.post<any>(`/query/function/`, {
		app_name: appName,
		page_name: pageName,
		fetcher,
		state: state.state,
	});

	if (response.data?.job_id) {
		const jobResponse = await fetchJobStatus(response.data.job_id);
		return jobResponse;
	}

	throw new Error('Failed to retrieve fetcher data');
};

export const useFetcherData = ({ fetcher, appName, pageName }: any) => {
	const pageState: any = useAtomValue(newPageStateAtom);
	const pageStateRef = useRef(pageState);
	pageStateRef.current = pageState;

	const queryKey = [TABLE_DATA_QUERY_KEY, fetcher, appName, pageName];

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
			enabled: true,
			staleTime: Infinity,
		},
	);

	const parsedData: any = useMemo(() => {
		if (response) {
			const header = [...(response?.columns || [])];

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
				tableError: response?.error,
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
