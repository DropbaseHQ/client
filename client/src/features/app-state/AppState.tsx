// import { useParams } from 'react-router-dom';
import { Box, Skeleton, Stack, Text } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';

import { useInitializePageState } from './hooks';
import { ObjectRenderer } from '@/components/ObjectRenderer';
import { newPageStateAtom } from '@/features/app-state';
import { pageAtom } from '../page';

const DEFAULT_OPEN_PATH = ['user_input', 'state', 'tables'];

export const AppState = () => {
	// const { pageId } = useParams();

	const { pageName, appName } = useAtomValue(pageAtom);
	const { isLoading } = useInitializePageState(appName || '', pageName || '');

	const pageState = useAtomValue(newPageStateAtom);

	if (isLoading) {
		return <Skeleton />;
	}

	return (
		<Stack spacing="0" bg="white" h="full">
			<Text flexShrink="0" fontSize="sm" p="2" borderBottomWidth="1px" fontWeight="semibold">
				State & Context
			</Text>
			<Box p="2" flex="1" h="full" overflowX="hidden" overflowY="auto">
				<ObjectRenderer obj={pageState} expandedPaths={DEFAULT_OPEN_PATH} />
			</Box>
		</Stack>
	);
};
