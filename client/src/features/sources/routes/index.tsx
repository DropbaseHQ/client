import { Navigate, Route, Routes } from 'react-router-dom';
import { Sources } from './Sources';
import { NewSource } from './NewSource';

export const SourceRoutes = () => {
	return (
		<Routes>
			<Route index element={<Sources />} />
			<Route path="new" element={<NewSource />} />
			<Route path="*" element={<Navigate to="." />} />
		</Routes>
	);
};
