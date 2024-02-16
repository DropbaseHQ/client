import { Route } from 'react-router-dom';
import { ProtectedRoutes } from '@/features/authorization/AuthContainer';
import { DeveloperSettings, Permissions } from '@/features/settings';
import { DashboardRoutes } from './DashboardRoutes';
import { Welcome } from '../features/welcome';

export const ProdDashboardRoutes = () => {
	return (
		<DashboardRoutes homeRoute="/welcome">
			<Route path="welcome" element={<Welcome />} />
			<Route element={<ProtectedRoutes />}>
				<Route path="settings/permissions" element={<Permissions />} />
				<Route path="settings/developer" element={<DeveloperSettings />} />
			</Route>
		</DashboardRoutes>
	);
};
