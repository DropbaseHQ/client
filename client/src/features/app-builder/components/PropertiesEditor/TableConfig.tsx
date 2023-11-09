import { Box, Divider, Stack } from '@chakra-ui/react';
import { ColumnsProperties } from './ColumnProperties';
import { TableProperties } from './TableProperties';

export const TableConfig = () => {
	return (
		<Stack bg="white" h="full" overflowY="auto" divider={<Divider />}>
			<TableProperties />

			<Box p="4">
				<ColumnsProperties />
			</Box>
		</Stack>
	);
};
