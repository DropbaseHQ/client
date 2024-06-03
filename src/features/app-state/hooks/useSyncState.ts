import { useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { pageContextAtom } from '@/features/app-state';

export const useSyncState = () => {
	const setPageContext = useSetAtom(pageContextAtom);

	const handleSyncState = useCallback(
		(data: any) => {
			if (data?.context && data?.type === 'context') {
				setPageContext(data?.context);
			}
		},
		[setPageContext],
	);

	return handleSyncState;
};
