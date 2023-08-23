import { Box, Stack } from '@chakra-ui/react';

import { PanelHandle } from '@/components/Panel';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { useMonacoLoader } from '@/components/Editor';
import { Table } from '@/features/smart-table/components/Table';
import { useParams } from 'react-router-dom';
import { useTableData } from '../smart-table/hooks/useTableData';
import { AppBuilderNavbar } from './components/BuilderNavbar';
import { Fetchers } from './components/Fetchers';
import { UIPanel, UIPreview } from './components/UIPreview';
import { UIState } from './components/UIState';

export const AppBuilder = () => {
	const { appId } = useParams();
	const [isEditorReady, _, languageClient] = useMonacoLoader();

	const { isLoading, dataclass } = useTableData({
		appId: appId,
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
				<PanelGroup direction="vertical">
					<Panel defaultSize={80}>
						<PanelGroup direction="horizontal">
							<Panel defaultSize={20}>
								<UIState />
							</Panel>
							<PanelHandle direction="vertical" />
							<Panel defaultSize={50}>{isEditorReady ? <Fetchers /> : null}</Panel>
							<PanelHandle direction="vertical" />
							<Panel defaultSize={30}>{isEditorReady ? <UIPanel /> : null}</Panel>
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
