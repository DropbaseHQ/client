import { Box, Skeleton } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { useParams } from 'react-router-dom';

import { useInitializePageState } from './hooks';
import { ObjectRenderer } from '@/components/ObjectRenderer';
import { pageStateContextAtom } from '@/features/app-state';

const DEFAULT_OPEN_PATH = ['state', 'context'];

export const AppState = () => {
	const { pageName, appName } = useParams();
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
