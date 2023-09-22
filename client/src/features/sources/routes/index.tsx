import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Sources } from './Sources';
import { NewSource } from './NewSource';

export const SourceRoutes = () => {
	const navigate = useNavigate();

	const handleCreateNewSource = () => {
		navigate('..');
	};

	return (
		<Routes>
			<Route index element={<Sources />} />
			<Route path="new" element={<NewSource onSuccess={handleCreateNewSource} />} />
			<Route path="*" element={<Navigate to="." />} />
		</Routes>
	);
};
