import { Route } from 'react-router-dom';
import { DeveloperSettings, Permissions } from '@/features/settings';
import { DashboardRoutes } from './DashboardRoutes';

export const ProdDashboardRoutes = () => {
	return (
		<DashboardRoutes homeRoute="/welcome">
			<Route path="settings/permissions" element={<Permissions />} />
			<Route path="settings/developer" element={<DeveloperSettings />} />
		</DashboardRoutes>
	);
};
