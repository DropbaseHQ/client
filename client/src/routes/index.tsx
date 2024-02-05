import { Center, Progress, Spinner, Stack, Text } from '@chakra-ui/react';
import { Suspense } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';
import { Login, Register, ResetPassword, EmailConfirmation } from '@/features/authorization';
import { DashboardLayout } from '@/layout';
import { App } from '@/features/app';
import { Users, DeveloperSettings, Permissions } from '@/features/settings';
import { Workspaces, useWorkspaces } from '@/features/workspaces';
import { RequestResetLink } from '@/features/authorization/RequestResetLink';
import {
	useSetAxiosToken,
	useSetWorkerAxiosBaseURL,
} from '@/features/authorization/hooks/useLogin';
import { useSyncProxyToken } from '@/features/settings/hooks/token';
import { ProtectedRoutes } from '@/features/authorization/AuthContainer';
import { Welcome } from '../features/welcome';
import { isProductionApp } from '../utils';
import { SOCKET_URL } from '@/features/app-preview';

export const DashboardRoutes = () => {
	const { isLoading } = useWorkspaces();
	useSyncProxyToken();
	useSetAxiosToken();
	useSetWorkerAxiosBaseURL();
	// Initialize websocket
	useWebSocket(SOCKET_URL, {
		share: true,
	});

	if (isLoading) {
		return (
			<DashboardLayout>
				<Center as={Stack} spacing="6" w="full" h="full">
					<Stack alignItems="center" spacing="0">
						<Text color="heading" fontSize="lg" fontWeight="medium">
							Checking user...
						</Text>
					</Stack>
					<Progress minW="sm" size="xs" isIndeterminate />
				</Center>
			</DashboardLayout>
		);
	}

	const isProductionURL = isProductionApp();

	return (
		<Suspense
			fallback={
				<Center w="full" h="full">
					<Spinner
						thickness="2px"
						speed="0.5s"
						emptyColor="gray.200"
						color="blue.500"
						size="lg"
					/>
				</Center>
			}
		>
			<Routes>
				<Route
					path="/"
					element={
						<DashboardLayout>
							<Outlet />
						</DashboardLayout>
					}
				>
					<Route
						index
						element={<Navigate to={isProductionURL ? '/welcome' : '/apps'} />}
					/>
					<Route path="login" element={<Login />} />
					<Route path="register" element={<Register />} />
					<Route path="forgot" element={<RequestResetLink />} />
					<Route path="reset" element={<ResetPassword />} />
					<Route path="welcome" element={<Welcome />} />
					<Route
						path="email-confirmation/:token/:userId"
						element={<EmailConfirmation />}
					/>
					<Route element={<ProtectedRoutes />}>
						{isProductionURL ? null : (
							<>
								<Route path="workspaces" element={<Workspaces />} />
								<Route path="apps/*" element={<App />} />
								<Route path="settings/members" element={<Users />} />
							</>
						)}
						<Route path="settings/permissions" element={<Permissions />} />
						<Route path="settings/developer" element={<DeveloperSettings />} />
					</Route>

					<Route
						path="*"
						element={<Navigate to={isProductionURL ? '/welcome' : '/apps'} />}
					/>
				</Route>
			</Routes>
		</Suspense>
	);
};
