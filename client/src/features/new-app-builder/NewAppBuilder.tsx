import { Box, Stack } from '@chakra-ui/react';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { PanelHandle } from '@/components/Panel';

import { AppBuilderNavbar } from './components/Navbar';
import { PropertiesEditor } from './components/PropertiesEditor';
import { NewAppPreview } from '@/features/new-app-preview';
import { NewSmartTable } from '@/features/new-smart-table';
import { NewAppState } from '@/features/new-app-state';
import { useInitPage } from '@/features/new-page';
import { Loader } from '@/components/Loader';

export const NewAppBuilder = () => {
	const { isLoading } = useInitPage();

	return (
		<Stack spacing="0" h="full">
			<AppBuilderNavbar />
			<Box h="full" overflowY="auto">
				<PanelGroup autoSaveId="main-panel" direction="vertical">
					<Panel defaultSize={35}>
						<PanelGroup autoSaveId="data-panel" direction="horizontal">
							<Panel defaultSize={80}>
								<Loader isLoading={isLoading}>
									<NewSmartTable />
								</Loader>
							</Panel>
							<PanelHandle direction="vertical" />
							<Panel>
								<Loader isLoading={isLoading}>
									<NewAppPreview isDevMode />
								</Loader>
							</Panel>
						</PanelGroup>
					</Panel>

					<PanelHandle boxShadow="0 -2px 4px rgba(0,0,0,0.2)" direction="horizontal" />

					<Panel>
						<PanelGroup autoSaveId="dev-panel" direction="horizontal">
							<Panel defaultSize={20}>
								<Loader isLoading={isLoading}>
									<NewAppState />
								</Loader>
							</Panel>
							<PanelHandle direction="vertical" />
							<Panel>
								<Loader isLoading={isLoading}>
									<PropertiesEditor />
								</Loader>
							</Panel>
						</PanelGroup>
					</Panel>
				</PanelGroup>
			</Box>
		</Stack>
	);
};
