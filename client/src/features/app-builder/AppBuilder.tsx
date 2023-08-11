import { Box, Stack } from '@chakra-ui/react';

import { Panel, PanelGroup } from 'react-resizable-panels';
// import { UIEditor } from './components/UIPreview';
import { PanelHandle } from '@/components/Panel';

import { Table } from '@/features/smart-table/components/Table';
import { UIPanel } from './components/UIPreview';
import { AppBuilderNavbar } from './components/BuilderNavbar';
// import { UIEditor } from './components/UIEditor';
import { Fetchers } from './components/Fetchers';

export const AppBuilder = () => {
	return (
		<Stack spacing="0" h="full">
			<AppBuilderNavbar />
			<Box h="full" overflowY="auto">
				<PanelGroup direction="vertical">
					<Panel defaultSize={80}>
						<PanelGroup direction="horizontal">
							<Panel defaultSize={20}>
								<Box p="6" overflowY="auto" bg="gray.50" h="full">
									State
								</Box>
							</Panel>

							<PanelHandle direction="vertical" />

							<Panel>
								<Fetchers />
							</Panel>

							<PanelHandle direction="vertical" />

							<Panel defaultSize={20}>
								UI Components
								<UIPanel />
							</Panel>
						</PanelGroup>
					</Panel>

					<PanelHandle direction="horizontal" />

					<Panel>
						<Table />
					</Panel>
				</PanelGroup>
			</Box>
		</Stack>
	);
};
