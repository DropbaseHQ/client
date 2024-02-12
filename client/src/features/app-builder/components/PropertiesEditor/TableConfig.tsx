import { Stack } from '@chakra-ui/react';
import { TableProperties } from './TableProperties';

export const TableConfig = () => {
	return (
		<Stack bg="white" h="full" overflowY="auto">
			<TableProperties />
		</Stack>
	);
};
