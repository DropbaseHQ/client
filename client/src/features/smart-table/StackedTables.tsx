import { Box, Stack } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { useParams } from 'react-router-dom';
import { useGetPage } from '@/features/page';
import { SmartTable } from './SmartTable';
import { InspectorContainer } from '@/features/app-builder';
import { appModeAtom } from '@/features/app/atoms';
import { NewTable } from '@/features/app-builder/components/PropertiesEditor/NewTable';

export const StackedTables = () => {
	const { pageId } = useParams();

	const { isPreview } = useAtomValue(appModeAtom);
	const { tables } = useGetPage(pageId);

	return (
		<Stack bg="white" spacing="8" p="4" h="full" overflow="auto">
			{tables.map((table: any) => (
				<Box flexShrink="0" key={table.id}>
					<InspectorContainer h="full" w="full" type="table" id={table.id}>
						<SmartTable tableId={table.id} />
					</InspectorContainer>
				</Box>
			))}

			{isPreview ? null : (
				<Box
					ml="auto"
					borderWidth="1px"
					borderStyle="dashed"
					p="2"
					borderRadius="md"
					minW="48"
				>
					<NewTable w="full" variant="secondary" />
				</Box>
			)}
		</Stack>
	);
};
