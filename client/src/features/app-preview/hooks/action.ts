import { useMutation, useQueryClient } from 'react-query';
import { useToast } from '@chakra-ui/react';
import { useAtom, useAtomValue } from 'jotai';
import { WIDGET_PREVIEW_QUERY_KEY } from '@/features/app-preview/hooks';
import { workerAxios } from '@/lib/axios';
import { fetchJobStatus } from '@/utils/worker-job';
import { pageAtom } from '@/features/page';
import { newPageStateAtom, useSyncState } from '@/features/app-state';
import { getErrorMessage } from '@/utils';

const executeAction = async ({ pageName, appName, pageState, functionName }: any) => {
	const response = await workerAxios.post(`/function/`, {
		page_name: pageName,
		app_name: appName,
		function_name: functionName,
		payload: pageState,
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

export const useEvent = () => {
	const toast = useToast();
	const [{ pageName, appName, widgetName, widgets }, setPageContext] = useAtom(pageAtom);

	const pageState = useAtomValue(newPageStateAtom);

	const syncState = useSyncState();

	const actionMutation = useExecuteAction({
		onSuccess: (data: any) => {
			syncState(data);
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to execute action',
				description: getErrorMessage(error),
			});
		},
	});

	const handleAction = (actionName: string) => {
		actionMutation.mutate({
			pageName,
			appName,
			functionName: actionName,
			pageState,
		});
	};

	const handleEvent = (event: any) => {
		if (event.type === 'widget') {
			const widget = widgets?.find((w: any) => w.name === event.value);

			if (widget?.type === 'modal') {
				setPageContext((oldPage: any) => ({
					...oldPage,
					widgetName: event.value,
					modals: [
						...oldPage.modals,
						{
							name: event.value,
							caller: widgetName,
						},
					],
				}));
			} else {
				setPageContext((oldPage: any) => ({
					...oldPage,
					widgetName: event.value,
				}));
			}
		} else if (event.type === 'function') {
			handleAction(event.value);
		}
	};

	return handleEvent;
};
