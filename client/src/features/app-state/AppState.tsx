import { Box, IconButton, Skeleton, Stack, Text, Tooltip } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { RotateCw } from 'react-feather';

import { useInitializePageState } from './hooks';
import { ObjectRenderer } from '@/components/ObjectRenderer';
import { newPageStateAtom } from '@/features/app-state';
import { pageAtom } from '../page';

const DEFAULT_OPEN_PATH = ['user_input', 'state', 'tables'];

export const AppState = () => {
	const { pageName, appName } = useAtomValue(pageAtom);
	const { isLoading, isRefetching, refetch } = useInitializePageState(
		appName || '',
		pageName || '',
	);

	const pageState = useAtomValue(newPageStateAtom);

	if (isLoading) {
		return <Skeleton />;
	}

	return (
		<Stack spacing="0" bg="white" h="full">
			<Stack alignItems="center" p="2" borderBottomWidth="1px" direction="row">
				<Text flexShrink="0" fontSize="sm" fontWeight="semibold">
					State & Context
				</Text>
				<Tooltip label="Re-sync state & context data">
					<IconButton
						ml="auto"
						aria-label="Re-sync state & context data"
						size="2xs"
						colorScheme="gray"
						icon={<RotateCw size="12" />}
						variant="outline"
						isLoading={isRefetching}
						onClick={() => refetch()}
					/>
				</Tooltip>
			</Stack>
			<Box p="2" flex="1" h="full" overflowX="hidden" overflowY="auto">
				<ObjectRenderer obj={pageState} expandedPaths={DEFAULT_OPEN_PATH} />
			</Box>
		</Stack>
	);
};
