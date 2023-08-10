import { Stack } from '@chakra-ui/react';

import { SmartTableNavbar } from './components/SmartTableNavbar';
import { Editor } from './components/Editor';
import { Table } from './components/Table';

/* <PanelGroup direction="vertical">
	<Panel defaultSize={40}>
		<Box overflowY="auto" h="full">
			<Editor />
		</Box>
	</Panel>
	<PanelResizeHandle>
		<Center
			borderTop=".5px solid"
			borderBottom=".5px solid"
			borderColor="bg-muted"
			cursor="ns-resize"
			w="full"
			shadow="xl"
			_hover={{
				bg: 'bg-surface',
				shadow: 'xl',
				boxShadow: '0px -5px 10px rgba(50, 50, 50, 0.1);',
			}}
		>
			<MoreHorizontal strokeWidth="1.5px" />
		</Center>
	</PanelResizeHandle>
	<Panel maxSize={60} defaultSize={60}>
		<Table />
	</Panel>
</PanelGroup>; */

export const SmartTable = () => {
	return (
		<Stack spacing="0" h="full">
			<SmartTableNavbar />

			<Stack h="full" spacing="0" overflowY="auto">
				<Editor />
				<Table />
			</Stack>
		</Stack>
	);
};
