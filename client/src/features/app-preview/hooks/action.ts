import { useMutation, useQueryClient } from 'react-query';

import { useAtom, useAtomValue } from 'jotai';
import { WIDGET_PREVIEW_QUERY_KEY } from '@/features/app-preview/hooks';
import { workerAxios } from '@/lib/axios';
import { fetchJobStatus } from '@/utils/worker-job';
import { pageAtom } from '@/features/page';
import { pageStateAtom, useSyncState } from '@/features/app-state';
import { getErrorMessage } from '@/utils';
import { useToast } from '@/lib/chakra-ui';

export const executeAction = async ({
	pageName,
	appName,
	pageState,
	action,
	resource,
	component,
	rowEdits,
}: any) => {
	const response = await workerAxios.post(`/function/class`, {
		page_name: pageName,
		app_name: appName,
		state: pageState,
		action,
		resource,
		component,
		row_edits: rowEdits,
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
	const [{ pageName, appName }] = useAtom(pageAtom);

	const pageState = useAtomValue(pageStateAtom);

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

	const handleAction = ({
		action,
		resource,
		component,
	}: {
		action: any;
		resource: any;
		component?: any;
	}) => {
		actionMutation.mutate({
			pageName,
			appName,
			action,
			resource,
			component,
			pageState,
		});
	};

	return { handleEvent: handleAction, mutation: actionMutation };
};
