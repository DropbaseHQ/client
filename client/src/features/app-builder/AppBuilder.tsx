import { Box, Stack } from '@chakra-ui/react';

import { Panel, PanelGroup } from 'react-resizable-panels';
import { PanelHandle } from '@/components/Panel';

import { Table } from '@/features/smart-table/components/Table';
import { UIPanel, UIPreview } from './components/UIPreview';
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

							<Panel defaultSize={30}>{isEditorReady ? <UIPanel /> : null}</Panel>

							<PanelHandle direction="vertical" />

							<Panel defaultSize={50}>{isEditorReady ? <Fetchers /> : null}</Panel>
						</PanelGroup>
					</Panel>

					<PanelHandle direction="horizontal" />

					<Panel>
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
					</Panel>
				</PanelGroup>
			</Box>
		</Stack>
	);
};
