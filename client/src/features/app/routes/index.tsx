import { Navigate, Route, Routes } from 'react-router-dom';
import { App } from './App';
import { AppList } from '@/features/app-list';
export const AppRoutes = () => {
	return (
		<Routes>
			<Route index element={<AppList />} />
			<Route path=":appId/:pageId/*" element={<App />} />
			<Route path="*" element={<Navigate to="." />} />
		</Routes>
	);
};
