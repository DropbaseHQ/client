import useWebSocket from 'react-use-websocket';
import { Badge, Box, Center, Circle, Spinner, Stack, Text } from '@chakra-ui/react';
import { useSetAtom } from 'jotai';
import { Route, Routes } from 'react-router-dom';
import { useGetWebSocketURL } from '@/features/authorization/hooks/useLogin';
import { websocketStatusAtom } from '@/features/app/atoms';

import { DashboardRoutes } from './DashboardRoutes';

import { Workspaces } from '@/features/workspaces';
import { App } from '@/features/app';
import { ProtectedRoutes } from '@/features/authorization/AuthContainer';
import { SettingsRoutes } from '@/features/settings/SettingsRoutes';
import { useStatus } from '../layout/StatusBar';

export const WorkerDashboardRoutes = () => {
	const setWebsocketIsAlive = useSetAtom(websocketStatusAtom);

	// useSyncProxyToken();
	// useSetAxiosToken();

	const { isLoading: isCheckingStatus } = useStatus();

	const workerIsConnected = true;

	const websocketURL = useGetWebSocketURL();

	useWebSocket(websocketURL, {
		share: true,
		shouldReconnect: () => true,
		reconnectAttempts: 3,
		reconnectInterval: (attemptNumber) => Math.min(2 ** attemptNumber * 1000, 10000),
		onOpen: () => {
			setWebsocketIsAlive(true);
		},
		onClose: () => {
			setWebsocketIsAlive(false);
		},
	});

	let children = null;

	/**
	 * Only show worker routes when the correct URL is set and track the Loading
	 * state of URL mappings since we want to make sure it was URL set after loading
	 * mappings
	 */
	// if (isLoading) {
	// 	children = (
	// 		<Route
	// 			path="*"
	// 			element={
	// 				<Center as={Stack}>
	// 					<Spinner />
	// 					<Text>Loading User Config...</Text>
	// 				</Center>
	// 			}
	// 		/>
	// 	);
	// }
	if (isCheckingStatus) {
		children = (
			<Route
				path="*"
				element={
					<Center h="full" as={Stack}>
						<Spinner />
						<Text>Connecting worker...</Text>
					</Center>
				}
			/>
		);
	} else if (!workerIsConnected) {
		children = (
			<Route
				path="*"
				element={
					<Center as={Stack} h="full">
						<Badge
							display="flex"
							alignItems="center"
							colorScheme="red"
							variant="subtle"
						>
							<Circle size="8px" bg="red.500" />
							<Box ml="2">Offline</Box>
						</Badge>
						<Text fontSize="xl" fontWeight="semibold">
							Worker not connected
						</Text>
						<Text fontSize="md">Please make sure your worker is connected</Text>
					</Center>
				}
			/>
		);
	} else {
		children = (
			<>
				<Route path="workspaces" element={<Workspaces />} />
				<Route path="apps/*" element={<App />} />
				<Route path="settings/*" element={<SettingsRoutes />} />
			</>
		);
	}

	return (
		<DashboardRoutes homeRoute="/apps">
			<Route element={<ProtectedRoutes />}>{children}</Route>
		</DashboardRoutes>
	);
};

export const WorkerDashboardWrapper = () => {
	return (
		<Routes>
			<Route path="/*" element={<WorkerDashboardRoutes />} />
		</Routes>
	);
};
