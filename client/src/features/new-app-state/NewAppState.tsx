import { useParams } from 'react-router-dom';
import { Box, Skeleton, Text } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';

import { useInitializePageState } from './hooks';
import { ObjectRenderer } from '@/components/ObjectRenderer';
import { newPageStateAtom } from '@/features/new-app-state';

export const NewAppState = () => {
	const { pageId } = useParams();

	const { isLoading } = useInitializePageState(pageId);

	const pageState = useAtomValue(newPageStateAtom);

	if (isLoading) {
		return <Skeleton />;
	}

	return (
		<Box p="2" bg="white" h="full" overflowY="auto">
			<Text fontSize="11pt" fontWeight="semibold" p="1">State</Text>
			<ObjectRenderer obj={pageState} />
		</Box>
	);
};
