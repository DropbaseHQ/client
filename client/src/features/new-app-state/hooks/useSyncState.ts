import { useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { allWidgetStateAtom, nonWidgetStateAtom } from '@/features/new-app-state';

export const useSyncState = () => {
	const setWidgetState = useSetAtom(allWidgetStateAtom);
	const setNonInteractiveState = useSetAtom(nonWidgetStateAtom);

	const handleSyncState = useCallback(
		(data: any) => {
			if (data.status === 'success' && data.is_state && data.state) {
				const { widget, ...other } = data?.state || {};

				setWidgetState((s) => ({ ...s, state: widget || {} }));
				setNonInteractiveState(other || {});
			}
		},
		[setNonInteractiveState, setWidgetState],
	);

	return handleSyncState;
};
