import { useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { allWidgetStateAtom, nonWidgetStateAtom } from '@/features/app-state';

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
