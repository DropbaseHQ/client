import { Navigate, Route, Routes } from 'react-router-dom';
import { App } from './App';

export const AppRoutes = () => {
	return (
		<Routes>
			<Route index element={<h1>List all Apps</h1>} />
			<Route path=":appId/*" element={<App />} />
			<Route path="*" element={<Navigate to="." />} />
		</Routes>
	);
};
