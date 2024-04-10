import useWebSocket from 'react-use-websocket';
import { useSetAtom } from 'jotai';
import { Route, Routes } from 'react-router-dom';
import { useGetWebSocketURL } from '@/features/authorization/hooks/useLogin';
import { websocketStatusAtom } from '@/features/app/atoms';

import { DashboardRoutes } from './DashboardRoutes';

import { App } from '@/features/app';
import { ProtectedRoutes } from '@/features/authorization/AuthContainer';
import { WorkerDisconnected } from '@/features/app-builder/components/WorkerDisconnected';

export const WorkerDashboardRoutes = () => {
	const setWebsocketIsAlive = useSetAtom(websocketStatusAtom);

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

	const children = (
		<>
			<Route path="apps/*" element={<App />} />
		</>
	);

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
