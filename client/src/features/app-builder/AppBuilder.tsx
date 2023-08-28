import { Box, Stack } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { PanelHandle } from '@/components/Panel';

import { useMonacoLoader } from '@/components/Editor';
import { Table } from '@/features/smart-table/components/Table';
import { useTableData } from '../smart-table/hooks/useTableData';
import { AppBuilderNavbar } from './components/BuilderNavbar';
import { Fetchers } from './components/Fetchers';
import { StudioAutoSaver } from './components/StudioAutoSaver';
import { UIPanel, UIPreview } from './components/UIPreview';
import { UIState } from './components/UIState';

export const AppBuilder = () => {
	const { pageId } = useParams();
	const [isEditorReady, , languageClient] = useMonacoLoader();

	const { isLoading, dataclass } = useTableData({
		pageId,
		filters: [],
		sorts: [],
	});

	if (!isLoading && languageClient) {
		languageClient.sendNotification('workspace/setTableSchema', { dataclass });
	}

	return (
		<Stack spacing="0" h="full">
			<AppBuilderNavbar />
			<StudioAutoSaver />
			<Box h="full" overflowY="auto">
				<PanelGroup direction="horizontal">
					<Panel defaultSize={80}>
						<PanelGroup direction="vertical">
							<Panel defaultSize={80}>
								<PanelGroup direction="horizontal">
									<Panel defaultSize={22.5}>
										<UIState />
									</Panel>

									<PanelHandle direction="vertical" />

									<Panel>{isEditorReady ? <Fetchers /> : null}</Panel>
								</PanelGroup>
							</Panel>

							<PanelHandle direction="horizontal" />

							<Panel maxSize={80}>
								<Table />
							</Panel>
						</PanelGroup>
					</Panel>

					<PanelHandle direction="vertical" />

					<Panel>
						<PanelGroup direction="vertical">
							<Panel>{isEditorReady ? <UIPanel /> : null}</Panel>

							<PanelHandle direction="horizontal" />

							<Panel>
								<Box p="4" h="full" bg="white">
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
