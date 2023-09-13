import { Box, Center, Spinner, Stack } from '@chakra-ui/react';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { PanelHandle } from '@/components/Panel';

import { AppBuilderNavbar } from './components/Navbar';
import { PropertiesEditor } from './components/PropertiesEditor';
import { NewAppPreview } from '@/features/new-app-preview';
import { NewSmartTable } from '@/features/new-smart-table';
import { NewAppState } from '@/features/new-app-state';
import { useInitPage } from '@/features/new-page';

export const NewAppBuilder = () => {
	const { isLoading } = useInitPage();

	if (isLoading) {
		return (
			<Stack spacing="0" h="full">
				<AppBuilderNavbar />
				<Center h="full" w="full">
					<Spinner />
				</Center>
			</Stack>
		);
	}

	return (
		<Stack spacing="0" h="full">
			<AppBuilderNavbar />
			<Box h="full" overflowY="auto">
				<PanelGroup direction="vertical">
					<Panel defaultSize={35}>
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
						<PanelGroup direction="horizontal">
							<Panel defaultSize={20}>
								<NewAppState />
							</Panel>
							<PanelHandle direction="vertical" />
							<Panel>
								<PropertiesEditor />
							</Panel>
						</PanelGroup>
					</Panel>
				</PanelGroup>
			</Box>
		</Stack>
	);
};
