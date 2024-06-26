import useWebSocket from 'react-use-websocket';
import { useSetAtom } from 'jotai';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { WEBSOCKET_URL } from '@/utils/url';
import { websocketStatusAtom } from '@/features/app/atoms';

import { App } from '@/features/app';
import { WorkerDisconnected } from '@/features/app-builder/components/WorkerDisconnected';
import { DashboardLayout } from '@/layout';

export const FreeDashboardRoutes = () => {
	const setWebsocketIsAlive = useSetAtom(websocketStatusAtom);

	useWebSocket(WEBSOCKET_URL, {
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
		<>
			<Routes>
				<Route
					path="/"
					element={
						<DashboardLayout>
							<Outlet />
						</DashboardLayout>
					}
				>
					<Route index element={<Navigate to="/apps" />} />
					<Route path="apps/*" element={<App />} />
					{/* <Route path="settings/*" element={<SettingsRoutes />} /> */}
					<Route path="*" element={<Navigate to="/apps" />} />
				</Route>
			</Routes>
			<WorkerDisconnected />
		</>
	);
};
