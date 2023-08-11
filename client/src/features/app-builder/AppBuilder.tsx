import { Box, Stack } from '@chakra-ui/react';

import { Panel, PanelGroup } from 'react-resizable-panels';
import { AppBuilderNavbar } from './components/BuilderNavbar';
import { Table } from '@/features/smart-table/components/Table';
import { UIPreview } from './components/UIPreview';
import { PanelHandle } from '@/components/Panel';

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
								<Box p="6" overflowY="auto" bg="gray.50" h="full">
									Fetchers
								</Box>
							</Panel>

							<PanelHandle direction="vertical" />

							<Panel defaultSize={20}>
								<PanelGroup direction="vertical">
									<Panel defaultSize={50}>
										<Box bg="gray.50" p="6" h="full">
											UI Code
										</Box>
									</Panel>

									<PanelHandle direction="horizontal" />

									<Panel maxSize={80}>
										<Box bg="gray.50" p="6" h="full">
											<UIPreview />
										</Box>
									</Panel>
								</PanelGroup>
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
