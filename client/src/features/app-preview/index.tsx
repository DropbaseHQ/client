import { Box, Stack } from '@chakra-ui/react';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { PanelHandle } from '@/components/Panel';
import { Table } from '@/features/smart-table/components/Table';
import { UIPreview } from '@/features/app-builder/components/UIPreview';

export const AppPreview = () => {
	return (
		<Stack spacing="0" h="full">
			<PanelGroup direction="horizontal">
				<Panel defaultSize={80} maxSize={80}>
					<Table />
				</Panel>
				<PanelHandle direction="vertical" />
				<Panel>
					<Box p="4">
						<UIPreview />
					</Box>
				</Panel>
			</PanelGroup>
		</Stack>
	);
};
