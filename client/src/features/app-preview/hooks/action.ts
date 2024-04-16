import { useMutation, useQueryClient } from 'react-query';

import { useAtom, useAtomValue } from 'jotai';
import { WIDGET_PREVIEW_QUERY_KEY } from '@/features/app-preview/hooks';
import { workerAxios } from '@/lib/axios';
import { fetchJobStatus } from '@/utils/worker-job';
import { pageAtom, useGetPage } from '@/features/page';
import { pageStateContextAtom, useSyncState } from '@/features/app-state';
import { getErrorMessage } from '@/utils';
import { useToast } from '@/lib/chakra-ui';
import { TABLE_DATA_QUERY_KEY } from '@/features/smart-table/hooks';

export const executeAction = async ({
	pageName,
	appName,
	pageState,
	functionName,
	fileName,
}: any) => {
	const response = await workerAxios.post(`/function/`, {
		page_name: pageName,
		app_name: appName,
		function_name: functionName,
		file_name: fileName,
		state: pageState.state,
	});

	if (response.data?.job_id) {
		const jobResponse = await fetchJobStatus(response.data.job_id);
		return jobResponse;
	}
	throw new Error('Failed to run python function');
};

export const useExecuteAction = (props: any = {}) => {
	const queryClient = useQueryClient();

	return useMutation(executeAction, {
		...props,
		onSettled: () => {
			queryClient.invalidateQueries(WIDGET_PREVIEW_QUERY_KEY);
		},
	});
};

export const useEvent = (props: any) => {
	const toast = useToast();
	const queryClient = useQueryClient();
	const [{ pageName, appName, widgets, widgetName }, setPageContext] = useAtom(pageAtom);
	const { tables } = useGetPage({ appName, pageName });

	const pageStateContext = useAtomValue(pageStateContextAtom);

	const syncState = useSyncState();

	const actionMutation = useExecuteAction({
		onSuccess: (data: any) => {
			syncState(data);
			props?.onSuccess?.(data);
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to execute action',
				description: getErrorMessage(error),
			});
			props?.onError?.();
		},
	});

	const handleAction = (actionName: string, fileName: string) => {
		actionMutation.mutate({
			pageName,
			appName,
			functionName: actionName,
			fileName,
			pageState: pageStateContext,
		});
	};

	const handleEvent = (event: any) => {
		switch (event.type) {
			case 'widget': {
				const widget = widgets?.find((w: any) => w.name === event.value);

				if (widget?.type === 'modal') {
					setPageContext((oldPage: any) => ({
						...oldPage,
						widgetName: event.value,
						modals: [
							...oldPage.modals.filter((m: any) => m.name !== event.value),
							{
								name: event.value,
								caller: widgetName,
							},
						],
					}));
				} else {
					setPageContext((oldPage: any) => ({
						...oldPage,
						modals: [],
						widgetName: event.value,
					}));
				}
				break;
			}
			case 'function': {
				handleAction(event.value, event.file);
				break;
			}
			case 'table': {
				queryClient.invalidateQueries([
					TABLE_DATA_QUERY_KEY,
					tables?.find((t: any) => t.name === event.value)?.fetcher,
				]);
				break;
			}
			default:
		}
	};

	return handleEvent;
};
