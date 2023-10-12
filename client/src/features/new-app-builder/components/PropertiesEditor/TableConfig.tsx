import { Box, Divider, Stack, Text } from '@chakra-ui/react';
import { ColumnsProperties } from './ColumnProperties';
import { TableProperties } from './TableProperties';

export const TableConfig = () => {
	return (
		<Stack h="full" bg="white">
			<Text p="3" borderBottomWidth="1px" fontWeight="semibold" size="sm">
				Table Properties
			</Text>
			<Stack h="full" overflowY="auto" divider={<Divider />}>
				<Box p="4">
					<TableProperties />
				</Box>
				<Box p="4">
					<ColumnsProperties />
				</Box>
			</Stack>
		</Stack>
	);
};
