import { Box, Stack } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useGetPage } from '@/features/new-page';
import { NewSmartTable } from './NewSmartTable';

export const StackedTables = () => {
	const { pageId } = useParams();

	const { tables } = useGetPage(pageId);

	return (
		<Stack spacing="0" h="full" overflow="auto">
			{tables.map((table: any) => (
				<Box flexShrink="0" borderBottomWidth="1px">
					<NewSmartTable tableId={table.id} />
				</Box>
			))}
		</Stack>
	);
};
