import { Box, Stack } from '@chakra-ui/react';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { PanelHandle } from '@/components/Panel';

import { AppBuilderNavbar } from './components/Navbar';
import { PropertiesEditor } from './components/PropertiesEditor';
import { NewAppPreview } from '@/features/new-app-preview';
import { NewSmartTable } from '@/features/new-smart-table';

export const NewAppBuilder = () => {
	return (
		<Stack spacing="0" h="full">
			<AppBuilderNavbar />
			<Box h="full" overflowY="auto">
				<PanelGroup direction="vertical">
					<Panel>
						<PanelGroup direction="horizontal">
							<Panel defaultSize={80}>
								<NewSmartTable />
							</Panel>
							<PanelHandle direction="vertical" />
							<Panel>
								<NewAppPreview />
							</Panel>
						</PanelGroup>
					</Panel>

					<PanelHandle direction="horizontal" />

					<Panel>
						<PropertiesEditor />
					</Panel>
				</PanelGroup>
			</Box>
		</Stack>
	);
};
