import { Box, Skeleton } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';

import { useInitializePageState } from './hooks';
import { ObjectRenderer } from '@/components/ObjectRenderer';
import { pageStateContextAtom } from '@/features/app-state';
import { pageAtom } from '../page';

const DEFAULT_OPEN_PATH = ['user_input', 'state', 'tables'];

export const AppState = () => {
	const { pageName, appName } = useAtomValue(pageAtom);
	const { isLoading } = useInitializePageState(appName || '', pageName || '');

	const pageState = useAtomValue(pageStateContextAtom);

	if (isLoading) {
		return <Skeleton />;
	}

	return (
		<Box p="2" flex="1" bg="white" h="full" overflowX="hidden" overflowY="auto">
			<ObjectRenderer obj={pageState} expandedPaths={DEFAULT_OPEN_PATH} />
		</Box>
	);
};
