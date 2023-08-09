import { Stack } from '@chakra-ui/react';

import { SmartTableNavbar } from './components/SmartTableNavbar';
import { Editor } from './components/Editor';
import { Table } from './components/Table';

export const SmartTable = () => {
	return (
		<Stack h="full">
			<SmartTableNavbar />

			<Stack h="full" overflowY="auto">
				<Editor />
				<Table />
			</Stack>
		</Stack>
	);
};
