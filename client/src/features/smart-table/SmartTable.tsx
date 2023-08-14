import { Stack } from '@chakra-ui/react';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { PanelHandle } from '@/components/Panel';

import { SmartTableNavbar } from './components/SmartTableNavbar';
import { Editor } from './components/editor';
import { Table } from './components/Table';

export const SmartTable = () => {
	return (
		<Stack spacing="0" h="full">
			<SmartTableNavbar />

			<Stack h="full" spacing="0" overflowY="auto">
				<PanelGroup direction="vertical">
					<Panel defaultSize={40}>
						<Editor />
					</Panel>

					<PanelHandle direction="horizontal" />

					<Panel maxSize={80} defaultSize={60}>
						<Table />
					</Panel>
				</PanelGroup>
			</Stack>
		</Stack>
	);
};
