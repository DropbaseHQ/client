import { useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import {
	APP_STATE_QUERY_KEY,
	allWidgetStateAtom,
	nonWidgetContextAtom,
} from '@/features/app-state';
import { workerAxios } from '@/lib/axios';
import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';

export const useSyncState = () => {
	const setWidgetState = useSetAtom(allWidgetStateAtom);
	const setNonInteractiveState = useSetAtom(nonWidgetContextAtom);

	const handleSyncState = useCallback(
		(data: any) => {
			if (data?.result?.context && data?.success) {
				const { widgets, ...other } = data.result.context;

				setWidgetState((s) => ({ ...s, state: widgets || {} }));
				setNonInteractiveState(other || {});
			}
		},
		[setNonInteractiveState, setWidgetState],
	);

	return handleSyncState;
};

// TODO: @yash-dropbase please review, removed from backend
const forceSyncState = async ({ pageId }: any) => {
	const response = await workerAxios.put(`/sync/page/${pageId}`, {
		page_id: pageId,
	});

	return response.data;
};

export const useForceSyncState = (props: any = {}) => {
	const queryClient = useQueryClient();
	const toast = useToast();

	return useMutation(forceSyncState, {
		...props,
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'Successfully synced state',
			});
			queryClient.invalidateQueries(APP_STATE_QUERY_KEY);
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to sync state',
				description: getErrorMessage(error),
			});
		},
	});
};
