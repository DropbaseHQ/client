import { Routes, Route, Outlet } from 'react-router-dom';
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
				{/* <Route index element={<Settings />} /> */}
				{/* <Route path="developer" element={<DeveloperSettings />} /> */}
				<Route path="members" element={<Users />} />
				<Route path="permissions" element={<Permissions />} />
				<Route path="groups" element={<Groups />} />

				{/* <Route path="*" element={<Navigate to="." />} /> */}
			</Route>
		</Routes>
	);
};
