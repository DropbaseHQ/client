import { Box, Stack } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useGetPage } from '@/features/new-page';
import { NewSmartTable } from './NewSmartTable';
import { InspectorContainer } from '@/features/new-app-builder';

export const StackedTables = () => {
	const { pageId } = useParams();

	const { tables } = useGetPage(pageId);

	return (
		<Stack bg="white" spacing="8" p="4" h="full" overflow="auto">
			{tables.map((table: any) => (
				<Box flexShrink="0" key={table.id}>
					<InspectorContainer h="full" w="full" type="table" id={table.id}>
						<NewSmartTable tableId={table.id} />
					</InspectorContainer>
				</Box>
			))}
		</Stack>
	);
};
