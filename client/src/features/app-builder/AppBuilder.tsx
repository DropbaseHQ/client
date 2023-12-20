import { Box, Stack } from '@chakra-ui/react';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { useEffect } from 'react';
import { useSetAtom } from 'jotai';

import { PanelHandle } from '@/components/Panel';

import { AppPreview } from '@/features/app-preview';
import { StackedTables } from '@/features/smart-table';
import { useInitPage } from '@/features/page';
import { Loader } from '@/components/Loader';
import { AppNavbar } from '@/features/app/components/AppNavbar';
import { PropertyPane } from '@/features/app-builder';

import { WorkerDisconnected } from './components/WorkerDisconnected';
import { inspectedResourceAtom } from './atoms';
import { BuilderSidebar } from './components/Sidebar';
import { FileContent } from './components/FilesExplorer/FileContent';

export const AppBuilder = () => {
	const { isLoading } = useInitPage();
	const setInspectedItem = useSetAtom(inspectedResourceAtom);

	useEffect(() => {
		return () => {
			setInspectedItem({
				id: null,
				type: null,
			});
		};
	}, [setInspectedItem]);

	return (
		<Stack spacing="0" h="full">
			<AppNavbar />
			<Box h="full" w="full" overflowY="auto">
				<PanelGroup direction="horizontal">
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
											<BuilderSidebar />
										</Loader>
									</Panel>
									<PanelHandle direction="vertical" />
									<Panel>
										<Loader isLoading={isLoading}>
											<FileContent />
										</Loader>
									</Panel>
								</PanelGroup>
							</Panel>
						</PanelGroup>
					</Panel>
					<PanelHandle direction="vertical" />
					<Panel defaultSize={20} maxSize={20} minSize={20}>
						<PropertyPane />
					</Panel>
				</PanelGroup>
			</Box>
			<WorkerDisconnected />
		</Stack>
	);
};
