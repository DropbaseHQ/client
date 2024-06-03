import useWebSocket from 'react-use-websocket';
import { useSetAtom } from 'jotai';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useGetWebSocketURL } from '@/features/authorization/hooks/useLogin';
import { websocketStatusAtom } from '@/features/app/atoms';

import { App } from '@/features/app';
import { WorkerDisconnected } from '@/features/app-builder/components/WorkerDisconnected';
import { DashboardLayout } from '@/layout';

export const FreeDashboardRoutes = () => {
	const setWebsocketIsAlive = useSetAtom(websocketStatusAtom);
	// FIXME: @jon what will be the value here?
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
