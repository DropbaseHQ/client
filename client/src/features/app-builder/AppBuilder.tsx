import { Box, Stack } from '@chakra-ui/react';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { PanelHandle } from '@/components/Panel';

import { AppPreview } from '@/features/app-preview';
import { StackedTables } from '@/features/smart-table';
import { AppState } from '@/features/app-state';
import { useInitPage } from '@/features/page';
import { Loader } from '@/components/Loader';
import { AppNavbar } from '@/features/app/components/AppNavbar';
import { PropertyPane } from '@/features/app-builder';
import { FilesExplorer } from './components/FilesExplorer';

export const AppBuilder = () => {
	const { isLoading } = useInitPage();

	return (
		<Stack spacing="0" h="full">
			<AppNavbar />
			<Box h="full" overflowY="auto">
				<PanelGroup autoSaveId="panel" direction="horizontal">
					<Panel>
						<PanelGroup autoSaveId="main-panel" direction="vertical">
							<Panel defaultSize={45}>
								<PanelGroup autoSaveId="data-panel" direction="horizontal">
									<Panel defaultSize={80}>
										<Loader isLoading={isLoading}>
											<StackedTables />
										</Loader>
									</Panel>
									<PanelHandle direction="vertical" />
									<Panel>
										<Loader isLoading={isLoading}>
											<AppPreview />
										</Loader>
									</Panel>
								</PanelGroup>
							</Panel>

							<PanelHandle
								boxShadow="0 -2px 4px rgba(0,0,0,0.2)"
								direction="horizontal"
							/>

							<Panel>
								<PanelGroup autoSaveId="dev-panel" direction="horizontal">
									<Panel defaultSize={20}>
										<Loader isLoading={isLoading}>
											<AppState />
										</Loader>
									</Panel>
									<PanelHandle direction="vertical" />
									<Panel>
										<Loader isLoading={isLoading}>
											<FilesExplorer />
										</Loader>
									</Panel>
								</PanelGroup>
							</Panel>
						</PanelGroup>
					</Panel>

					<PanelHandle direction="vertical" />

					<Panel defaultSize={15} maxSize={20}>
						<PropertyPane />
					</Panel>
				</PanelGroup>
			</Box>
		</Stack>
	);
};
