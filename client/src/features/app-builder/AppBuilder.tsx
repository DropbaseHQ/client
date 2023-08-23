import { useParams } from 'react-router-dom';
import { Box, Stack } from '@chakra-ui/react';

import { Panel, PanelGroup } from 'react-resizable-panels';
import { PanelHandle } from '@/components/Panel';

import { Table } from '@/features/smart-table/components/Table';
import { UIPanel, UIPreview } from './components/UIPreview';
import { AppBuilderNavbar } from './components/BuilderNavbar';
import { Fetchers } from './components/Fetchers';
import { useMonacoLoader } from '@/components/Editor';
import { UIState } from './components/UIState';
import { useTableData } from '../smart-table/hooks/useTableData';

export const AppBuilder = () => {
	const { appId } = useParams();
	const [isEditorReady, , languageClient] = useMonacoLoader();

	const { isLoading, dataclass } = useTableData({
		appId,
		filters: [],
		sorts: [],
	});

	if (!isLoading && languageClient) {
		languageClient.sendNotification('workspace/setTableSchema', { dataclass });
	}

	return (
		<Stack spacing="0" h="full">
			<AppBuilderNavbar />
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
