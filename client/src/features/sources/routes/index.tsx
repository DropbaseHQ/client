import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Sources } from './Sources';
import { NewSource } from './NewSource';
import { Source } from './Source';

export const SourceRoutes = () => {
	const navigate = useNavigate();

	const handleCreateNewSource = () => {
		navigate('..');
	};

	return (
		<Routes>
			<Route index element={<Sources />} />
			<Route path="new" element={<NewSource onSuccess={handleCreateNewSource} />} />
			<Route path=":sourceId" element={<Source />} />
			<Route path="*" element={<Navigate to="." />} />
		</Routes>
	);
};
