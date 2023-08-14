import { Box, Stack } from '@chakra-ui/react';

import { Panel, PanelGroup } from 'react-resizable-panels';
import { PanelHandle } from '@/components/Panel';

import { Table } from '@/features/smart-table/components/Table';
import { UIPanel } from './components/UIPreview';
import { AppBuilderNavbar } from './components/BuilderNavbar';
import { Fetchers } from './components/Fetchers';
import { useMonacoLoader } from '@/components/Editor';
import { UIState } from './components/UIState';

export const AppBuilder = () => {
	const isEditorReady = useMonacoLoader();

	return (
		<Stack spacing="0" h="full">
			<AppBuilderNavbar />
			<Box h="full" overflowY="auto">
				<PanelGroup direction="vertical">
					<Panel defaultSize={80}>
						<PanelGroup direction="horizontal">
							<Panel defaultSize={20}>
								<UIState />
							</Panel>

							<PanelHandle direction="vertical" />

							<Panel>{isEditorReady ? <Fetchers /> : null}</Panel>

							<PanelHandle direction="vertical" />

							<Panel defaultSize={20}>{isEditorReady ? <UIPanel /> : null}</Panel>
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
