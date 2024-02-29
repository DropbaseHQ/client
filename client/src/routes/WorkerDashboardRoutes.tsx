import { useEffect } from 'react';
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
import { Users, DeveloperSettings, Permissions } from '@/features/settings';
import { ProtectedRoutes } from '@/features/authorization/AuthContainer';

export const WorkerDashboardRoutes = () => {
	useEffect(() => {
		let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
		if (!link) {
			link = document.createElement('link') as HTMLLinkElement;
			link.rel = 'shortcut icon';
			document.getElementsByTagName('head')[0].appendChild(link);
		}
		link.type = 'image/x-icon';
		if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			link.href = '/favicon-dark.ico';
		} else {
			link.href = '/favicon-light.ico';
		}
		if (window.location.hostname === 'localhost') {
			link.href = '/favicon-dev.ico';
		}
	}, []);

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
				<Route path="settings/members" element={<Users />} />
				<Route path="settings/permissions" element={<Permissions />} />
				<Route path="settings/developer" element={<DeveloperSettings />} />
			</Route>
		</DashboardRoutes>
	);
};
