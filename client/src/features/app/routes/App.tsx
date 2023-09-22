import { Navigate, Route, Routes } from 'react-router-dom';

import { NewAppBuilder } from '@/features/new-app-builder';
import { NewApp } from '../components';

export const App = () => {
	return (
		<Routes>
			<Route index element={<NewAppBuilder />} />
			<Route path="editor" element={<Navigate to="new-editor" />} />
			<Route path="preview" element={<Navigate to="new-preview" />} />
			<Route path="new-preview" element={<NewApp />} />
			<Route path="new-editor" element={<NewAppBuilder />} />
		</Routes>
	);
};
