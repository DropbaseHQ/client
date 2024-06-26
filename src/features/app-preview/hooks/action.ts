import { useMutation, useQueryClient } from 'react-query';

import { useAtomValue, useSetAtom } from 'jotai';
import { useParams } from 'react-router-dom';
import { WIDGET_PREVIEW_QUERY_KEY } from '@/features/app-preview/hooks';
import { workerAxios } from '@/lib/axios';
import { fetchJobStatus } from '@/utils/worker-job';
import { pageStateAtom, useSyncState } from '@/features/app-state';
import { getErrorMessage, getLogInfo } from '@/utils';
import { useToast } from '@/lib/chakra-ui';
import { logsAtom } from '@/features/app-builder/atoms';

export const executeAction = async ({
	pageName,
	appName,
	pageState,
	action,
	resource,
	component,
	rowEdits,
	section,
	row,
}: any) => {
	const response = await workerAxios.post(`/function/class/`, {
		page_name: pageName,
		app_name: appName,
		state: pageState,
		action,
		resource,
		component,
		updates: rowEdits,
		section,
		row,
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

export const useEvent = (props?: any) => {
	const toast = useToast();
	const { pageName, appName } = useParams();

	const pageState = useAtomValue(pageStateAtom);

	const setLogs = useSetAtom(logsAtom);

	const syncState = useSyncState();

	const actionMutation = useExecuteAction({
		onSuccess: (data: any, variables: any) => {
			syncState(data);
			setLogs({
				...getLogInfo({ info: data }),
				meta: {
					type: 'ui_event',
					action: variables?.action,
					resource: variables?.resource,
					component: variables?.component,
					state: variables.pageState,
					section: variables?.section,
				},
			});
			props?.onSuccess?.(data);
		},
		onError: (error: any, variables: any) => {
			setLogs({
				...getLogInfo({ info: error, isError: true }),
				meta: {
					type: 'ui_event',
					action: variables?.action,
					resource: variables?.resource,
					component: variables?.component,
					state: variables.pageState,
					section: variables?.section,
				},
			});

			toast({
				status: 'error',
				title: 'Failed to execute action',
				description: getErrorMessage(error),
			});
			props?.onError?.();
		},
	});

	const handleAction = ({
		action,
		resource,
		component,
		newState,
		section,
	}: {
		action: any;
		resource: any;
		component?: any;
		newState?: any;
		section: any;
	}) => {
		actionMutation.mutate({
			pageName,
			appName,
			action,
			resource,
			component,
			pageState: newState || pageState,
			section,
		});
	};

	return { handleEvent: handleAction, mutation: actionMutation };
};
