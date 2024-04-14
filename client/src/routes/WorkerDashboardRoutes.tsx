import useWebSocket from 'react-use-websocket';
import { Center, Spinner, Stack, Text } from '@chakra-ui/react';
import { useSetAtom } from 'jotai';
import { Route, Routes } from 'react-router-dom';
import {
	useGetWebSocketURL,
	useSetAxiosToken,
	useSetWorkerAxiosBaseURL,
} from '@/features/authorization/hooks/useLogin';
import { websocketStatusAtom } from '@/features/app/atoms';

import { useSyncProxyToken } from '@/features/settings/hooks/token';
import { DashboardRoutes } from './DashboardRoutes';

import { Workspaces } from '@/features/workspaces';
import { App } from '@/features/app';
import { ProtectedRoutes } from '@/features/authorization/AuthContainer';
import { SettingsRoutes } from '@/features/settings/SettingsRoutes';
import { WorkerDisconnected } from '@/features/app-builder/components/WorkerDisconnected';

export const WorkerDashboardRoutes = () => {
	const setWebsocketIsAlive = useSetAtom(websocketStatusAtom);

	useSyncProxyToken();
	useSetAxiosToken();
	const { urlSet, isLoading } = useSetWorkerAxiosBaseURL();

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
	if (isLoading) {
		children = (
			<Route
				path="*"
				element={
					<Center as={Stack}>
						<Spinner />
						<Text>Loading User Config...</Text>
					</Center>
				}
			/>
		);
	} else if (!urlSet) {
		children = (
			<Route
				path="*"
				element={
					<Center>
						<Text>URL Mapping not set</Text>
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
		<>
			<DashboardRoutes homeRoute="/apps">
				<Route element={<ProtectedRoutes />}>{children}</Route>
			</DashboardRoutes>
			<WorkerDisconnected />
		</>
	);
};

export const WorkerDashboardWrapper = () => {
	return (
		<Routes>
			<Route path="/*" element={<WorkerDashboardRoutes />} />
		</Routes>
	);
};
