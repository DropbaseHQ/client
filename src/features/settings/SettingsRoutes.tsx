import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { SettingsLayout, Users, Permissions, Groups } from '@/features/settings';

export const SettingsRoutes = () => {
	return (
		<Routes>
			<Route
				path="/"
				element={
					<SettingsLayout>
						<Outlet />
					</SettingsLayout>
				}
			>
				<Route index element={<Navigate to="/settings" />} />
				<Route path="members" element={<Users />} />
				<Route path="permissions" element={<Permissions />} />
				<Route path="groups" element={<Groups />} />

				<Route path="*" element={<Navigate to="/settings" />} />
			</Route>
		</Routes>
	);
};
