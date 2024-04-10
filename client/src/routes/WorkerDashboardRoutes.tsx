import useWebSocket from 'react-use-websocket';
import { Badge, Box, Center, Circle, Spinner, Stack, Text } from '@chakra-ui/react';
import { useSetAtom } from 'jotai';
import { Route, Routes } from 'react-router-dom';
import { useGetWebSocketURL } from '@/features/authorization/hooks/useLogin';
import { websocketStatusAtom } from '@/features/app/atoms';

import { DashboardRoutes } from './DashboardRoutes';

import { App } from '@/features/app';
import { ProtectedRoutes } from '@/features/authorization/AuthContainer';
import { useStatus } from '@/features/settings/hooks/workspace';

export const WorkerDashboardRoutes = () => {
	const setWebsocketIsAlive = useSetAtom(websocketStatusAtom);

	const { status, isLoading: isCheckingStatus } = useStatus();
	const workerIsConnected = status === 'success';

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
				<Route path="apps/*" element={<App />} />
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
