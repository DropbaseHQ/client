import { Route } from 'react-router-dom';
import { ProtectedRoutes } from '@/features/authorization/AuthContainer';
import { DashboardRoutes } from './DashboardRoutes';
import { SettingsRoutes } from '@/features/settings/SettingsRoutes';
import { Welcome } from '../features/welcome';

export const ProdDashboardRoutes = () => {
	return (
		<DashboardRoutes homeRoute="/welcome">
			<Route element={<ProtectedRoutes />}>
				<Route path="welcome" element={<Welcome />} />

				<Route path="settings/*" element={<SettingsRoutes />} />
			</Route>
		</DashboardRoutes>
	);
};
