import {
	Alert,
	AlertDescription,
	AlertIcon,
	AlertTitle,
	Box,
	Center,
	Stack,
	useTheme,
} from '@chakra-ui/react';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/lib/chakra-ui';
import { PanelHandle } from '@/components/Panel';

import { AppPreview } from '@/features/app-preview';
import { StackedTables } from '@/features/smart-table';
import { useGetPage } from '@/features/page';
import { Loader } from '@/components/Loader';
import { AppNavbar } from '@/features/app/components/AppNavbar';
import { PropertyPane } from '@/features/app-builder';

import { WorkerDisconnected } from './components/WorkerDisconnected';
import { inspectedResourceAtom } from './atoms';
import { BuilderSidebar } from './components/Sidebar';
import { FileContent } from './components/FilesExplorer/FileContent';
import { useInitializePageState } from '@/features/app-state';

import { PromptModal } from '@/features/ai';
import { getErrorMessage, isFreeApp } from '@/utils';
import { appModeAtom } from '@/features/app/atoms';

export const AppBuilder = () => {
	const { appName, pageName } = useParams();
	const navigate = useNavigate();
	const toast = useToast();

	const { isPreview } = useAtomValue(appModeAtom);

	const { isLoading: isLoadingState } = useInitializePageState(appName || '', pageName || '');

	const theme = useTheme();
	const setInspectedItem = useSetAtom(inspectedResourceAtom);
	const {
		permissions,
		isLoading: appStateIsLoading,
		error,
	} = useGetPage({
		appName,
		pageName,
	});

	const isLoading = isLoadingState || appStateIsLoading;

	useEffect(() => {
		return () => {
			setInspectedItem({
				id: null,
				type: null,
				meta: null,
			});
		};
	}, [setInspectedItem]);

	useEffect(() => {
		if (!isFreeApp() && !appStateIsLoading && !permissions?.edit) {
			toast({
				title: 'Unauthorized',
				description: 'You do not have permission to edit this page.',
				status: 'error',
			});
			navigate(`/apps/${appName}/${pageName}`);
		}
	}, [appStateIsLoading, permissions, appName, navigate, pageName, toast]);

	if (error) {
		return (
			<Stack spacing="0" h="full">
				<AppNavbar />
				<Center bg="gray.50" h="full">
					<Alert
						status="error"
						variant="subtle"
						flexDirection="column"
						alignItems="center"
						justifyContent="center"
						textAlign="center"
						maxW="container.sm"
					>
						<AlertIcon boxSize="30px" mr={0} />
						<AlertTitle mt={4} mb={1} fontSize="xl">
							Something went wrong!
						</AlertTitle>
						<AlertDescription maxWidth="sm">{getErrorMessage(error)}</AlertDescription>
					</Alert>
				</Center>
			</Stack>
		);
	}

	if (isPreview) {
		return (
			<Stack spacing="0" h="full">
				<AppNavbar isPreview />
				<PanelGroup direction="horizontal">
					<Panel defaultSize={80} minSize={10}>
						<Loader isLoading={isLoading}>
							<StackedTables />
						</Loader>
					</Panel>
					<PanelHandle direction="vertical" />
					<Panel minSize={10}>
						<Loader isLoading={isLoading}>
							<AppPreview />
						</Loader>
					</Panel>
				</PanelGroup>
			</Stack>
		);
	}

	return (
		<Stack spacing="0" h="full">
			<AppNavbar />
			<Box h="full" w="full" overflowY="auto">
				<PanelGroup direction="horizontal">
					<Panel>
						<PanelGroup autoSaveId="main-panel" direction="vertical">
							<Box as={Panel} p={4} bg="gray.50" defaultSize={45}>
								<Box
									as={PanelGroup}
									borderWidth="1px"
									borderRadius="lg"
									autoSaveId="data-panel"
									boxShadow={`0 0px 5px ${theme.colors.blackAlpha[300]}`}
									direction="horizontal"
								>
									<Panel defaultSize={80} minSize={10}>
										<Loader isLoading={isLoading}>
											<StackedTables />
										</Loader>
									</Panel>
									<PanelHandle direction="vertical" />
									<Panel minSize={10}>
										<Loader isLoading={isLoading}>
											<AppPreview />
										</Loader>
									</Panel>
								</Box>
							</Box>

							<PanelHandle direction="horizontal" />

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
					<PanelHandle
						style={{ cursor: 'auto', pointerEvents: 'none' }}
						direction="vertical"
					/>
					<Panel defaultSize={15} maxSize={15} minSize={15}>
						<PropertyPane />
					</Panel>
				</PanelGroup>
			</Box>
			<WorkerDisconnected />
			<PromptModal />
		</Stack>
	);
};
