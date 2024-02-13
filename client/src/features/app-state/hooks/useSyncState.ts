import { useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { allWidgetStateAtom, nonWidgetContextAtom } from '@/features/app-state';

export const useSyncState = () => {
	const setWidgetState = useSetAtom(allWidgetStateAtom);
	const setNonInteractiveState = useSetAtom(nonWidgetContextAtom);

	const handleSyncState = useCallback(
		(data: any) => {
			if (data?.context && data?.type === 'context') {
				const { widgets, ...other } = data.context;

				setWidgetState((s) => ({ ...s, state: widgets || {} }));
				setNonInteractiveState(other || {});
			}
		},
		[setNonInteractiveState, setWidgetState],
	);

	return handleSyncState;
};
