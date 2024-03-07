import useWebSocket from 'react-use-websocket';
import { useSetAtom } from 'jotai';
import { Route } from 'react-router-dom';
import {
	useSetAxiosToken,
	useSetWorkerAxiosBaseURL,
} from '@/features/authorization/hooks/useLogin';
import { websocketStatusAtom } from '@/features/app/atoms';

import { useSyncProxyToken } from '@/features/settings/hooks/token';
import { SOCKET_URL } from '@/features/app-preview/WidgetPreview';
import { DashboardRoutes } from './DashboardRoutes';

import { Workspaces } from '@/features/workspaces';
import { App } from '@/features/app';
import { ProtectedRoutes } from '@/features/authorization/AuthContainer';
import { SettingsRoutes } from '@/features/settings/SettingsRoutes';

export const WorkerDashboardRoutes = () => {
	const setWebsocketIsAlive = useSetAtom(websocketStatusAtom);

	useSyncProxyToken();
	useSetAxiosToken();
	useSetWorkerAxiosBaseURL();
	// Initialize websocket
	useWebSocket(SOCKET_URL, {
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

	return (
		<DashboardRoutes homeRoute="/apps">
			<Route element={<ProtectedRoutes />}>
				<Route path="workspaces" element={<Workspaces />} />
				<Route path="apps/*" element={<App />} />
				<Route path="settings/*" element={<SettingsRoutes />} />
			</Route>
		</DashboardRoutes>
	);
};
