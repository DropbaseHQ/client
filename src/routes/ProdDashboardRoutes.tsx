import { Route } from 'react-router-dom';
import { DashboardRoutes } from './DashboardRoutes';
import { Welcome } from '../features/welcome';

export const ProdDashboardRoutes = () => {
	return (
		<DashboardRoutes homeRoute="/welcome">
			<Route path="welcome" element={<Welcome />} />
		</DashboardRoutes>
	);
};
