import { useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { APP_STATE_QUERY_KEY, allWidgetStateAtom, nonWidgetStateAtom } from '@/features/app-state';
import { workerAxios } from '@/lib/axios';
import { useMutation, useQueryClient } from 'react-query';
import { useToast } from '@/lib/chakra-ui';

export const useSyncState = () => {
	const setWidgetState = useSetAtom(allWidgetStateAtom);
	const setNonInteractiveState = useSetAtom(nonWidgetStateAtom);

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


const forceSyncState = async ({  pageId,   }: any) => {
	const response = await workerAxios.put(`/sync/page/${pageId}`, {
		page_id: pageId, 
	});

	return response.data;
};

export const useForceSyncState = (props: any = {}) => {
	const queryClient = useQueryClient();
	const toast = useToast()
	
	return useMutation(forceSyncState, {
		...props,
		onSuccess: () => {
			toast({
				status: "success",
				title: "Successfully synced state"
			})
			queryClient.invalidateQueries(APP_STATE_QUERY_KEY); 
		},
		onError: (error:any) => {
			toast({
				status: "error",
				title: "Failed to sync state",
				description:  error?.response?.data?.error || error?.response?.data || error?.message || '',
			})
		},
	});
};
