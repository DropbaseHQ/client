import { Route } from 'react-router-dom';
import { ProtectedRoutes } from '@/features/authorization/AuthContainer';
import { DeveloperSettings, Permissions, Users } from '@/features/settings';
import { DashboardRoutes } from './DashboardRoutes';
import { Welcome } from '../features/welcome';

export const ProdDashboardRoutes = () => {
	return (
		<DashboardRoutes homeRoute="/welcome">
			<Route element={<ProtectedRoutes />}>
				<Route path="welcome" element={<Welcome />} />

				<Route path="settings/members" element={<Users />} />
				<Route path="settings/permissions" element={<Permissions />} />
				<Route path="settings/developer" element={<DeveloperSettings />} />
			</Route>
		</DashboardRoutes>
	);
};
