import { useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { allWidgetStateAtom, nonWidgetStateAtom } from '@/features/new-app-state';

export const useSyncState = () => {
	const setWidgetState = useSetAtom(allWidgetStateAtom);
	const setNonInteractiveState = useSetAtom(nonWidgetStateAtom);

	const handleSyncState = useCallback(
		(state: any) => {
			const { widget, ...other } = state || {};

			setWidgetState((s) => ({ ...s, state: widget || {} }));
			setNonInteractiveState(other || {});
		},
		[setNonInteractiveState, setWidgetState],
	);

	return handleSyncState;
};
