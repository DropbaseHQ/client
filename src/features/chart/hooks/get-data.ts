import { useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import { useAtomValue, useSetAtom } from 'jotai';

import { useGetPage } from '@/features/page';
import { pageStateAtom, useSyncState } from '@/features/app-state';
import { executeAction } from '@/features/app-preview/hooks';
import { ACTIONS } from '@/constant';
import { getErrorMessage, getLogInfo } from '@/utils';
import { useToast } from '@/lib/chakra-ui';
import { logsAtom } from '@/features/app-builder/atoms';

export const CHART_DATA_QUERY_KEY = 'chartData';

const fetchChartData = async ({ appName, pageName, chartName, state }: any) => {
	const response = await executeAction({
		pageName,
		appName,
		pageState: state,
		action: ACTIONS.GET_DATA,
		resource: chartName,
	});

	return response;
};

export const useChartData = ({ chartName, appName, pageName }: any) => {
	const { isFetching: isLoadingPage } = useGetPage({ appName, pageName });

	const pageState: any = useAtomValue(pageStateAtom);
	const pageStateRef = useRef(pageState);
	pageStateRef.current = pageState;

	const queryKey = [CHART_DATA_QUERY_KEY, chartName, appName, pageName];

	const syncState = useSyncState();
	const setLogs = useSetAtom(logsAtom);
	const toast = useToast();

	const { data: response, ...rest } = useQuery(
		queryKey,
		() =>
			fetchChartData({
				appName,
				pageName,
				chartName,
				state: pageStateRef.current,
			}),
		{
			enabled: !!(
				!isLoadingPage &&
				appName &&
				pageName &&
				Object.keys(pageState || {}).length > 0
			),
			staleTime: Infinity,
			onSuccess: (data: any) => {
				syncState(data);
				setLogs({
					...getLogInfo({ info: data }),
					meta: {
						type: 'chart',
						action: 'get',
						resource: chartName,
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
						type: 'chart',
						action: 'get',
						resource: chartName,
						state: pageStateRef.current,
					},
				});
			},
		},
	);

	// TODO: watch out for reseting of context
	useEffect(() => {
		syncState(response);
	}, [response, syncState]);

	return {
		...rest,
		queryKey,
	};
};
