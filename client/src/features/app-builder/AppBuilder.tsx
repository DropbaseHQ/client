import { PropsWithChildren } from 'react';
import { Box, Center, CenterProps, Stack } from '@chakra-ui/react';

import { MoreHorizontal, MoreVertical } from 'react-feather';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { AppBuilderNavbar } from './components/BuilderNavbar';
import { Table } from '@/features/smart-table/components/Table';

const PanelHandleContainer = ({ children, ...props }: PropsWithChildren<CenterProps>) => {
	return (
		<PanelResizeHandle>
			<Center
				_hover={{
					borderColor: 'gray.200',
					boxShadow: '0px 2px 5px rgba(0,0,0,.1) inset',
				}}
				{...props}
			>
				{children}
			</Center>
		</PanelResizeHandle>
	);
};

export const AppBuilder = () => {
	return (
		<Stack spacing="0" h="full">
			<AppBuilderNavbar />
			<Box h="full" overflowY="auto">
				<PanelGroup direction="vertical">
					<Panel defaultSize={80}>
						<PanelGroup direction="horizontal">
							<Panel defaultSize={20}>
								{/* Replace with state component  */}
								<Box p="6" overflowY="auto" bg="gray.50" h="full">
									State
								</Box>
							</Panel>

							<PanelHandleContainer
								borderLeftWidth="1px"
								borderRightWidth="1px"
								h="full"
							>
								<MoreVertical size="16" />
							</PanelHandleContainer>

							<Panel>
								{/* Replace with Fetchers component  */}
								<Box p="6" overflowY="auto" bg="gray.50" h="full">
									Fetchers
								</Box>
							</Panel>

							<PanelHandleContainer
								borderLeftWidth="1px"
								borderRightWidth="1px"
								h="full"
							>
								<MoreVertical size="16" />
							</PanelHandleContainer>

							<Panel defaultSize={20}>
								{/* Replace with UI component  */}
								<Box bg="gray.50" p="6" h="full">
									UI Code
								</Box>
							</Panel>
						</PanelGroup>
					</Panel>

					<PanelHandleContainer borderTopWidth="1px" borderBottomWidth="1px" w="full">
						<MoreHorizontal size="16" />
					</PanelHandleContainer>

					<Panel>
						<Table />
					</Panel>
				</PanelGroup>
			</Box>
		</Stack>
	);
};
