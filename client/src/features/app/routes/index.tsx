import { Navigate, Route, Routes } from 'react-router-dom';
import { AppRoutes } from './AppRoutes';
import { AppList } from '@/features/app-list';
import { useSyncProxyToken } from '@/features/settings/hooks/token';

export const App = () => {
	const { hasTokens, isLoading } = useSyncProxyToken();

	if (!hasTokens && !isLoading) {
		return <Navigate to="/settings/developer" />;
	}
	return (
		<Routes>
			<Route index element={<AppList />} />
			<Route path=":appId/:pageId/*" element={<AppRoutes />} />
			<Route path="*" element={<Navigate to="." />} />
		</Routes>
	);
};
