import { useSetAtom } from 'jotai';
import { Alert, AlertDescription, AlertIcon, AlertTitle, Center, Stack } from '@chakra-ui/react';
import { useEffect } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { useParams } from 'react-router-dom';

import { PanelHandle } from '@/components/Panel';
import { AppPreview } from '@/features/app-preview';
import { StackedTables } from '@/features/smart-table';
import { Loader } from '@/components/Loader';

import { AppNavbar } from './AppNavbar';
import { appModeAtom } from '@/features/app/atoms';
import { useInitializePageState } from '@/features/app-state';
import { getErrorMessage } from '@/utils';

export const App = () => {
	const updateMode = useSetAtom(appModeAtom);
	const { appName, pageName } = useParams();

	const { isLoading: isLoadingState, error } = useInitializePageState(
		appName || '',
		pageName || '',
	);

	const isLoading = isLoadingState;

	useEffect(() => {
		updateMode({
			isPreview: true,
		});

		return () => {
			updateMode({
				isPreview: false,
			});
		};
	}, [updateMode]);

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
};
