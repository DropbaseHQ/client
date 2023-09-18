import { Route, Routes } from 'react-router-dom';

import { AppBuilder } from '@/features/app-builder';
import { NewAppBuilder } from '@/features/new-app-builder';
import { SmartTable } from '@/features/smart-table';
import { AppPreview } from '@/features/app-preview';
import { NewApp } from '../components';

export const App = () => {
	return (
		<Routes>
			<Route index element={<SmartTable />} />
			<Route path="editor" element={<AppBuilder />} />
			<Route path="preview" element={<AppPreview />} />
			<Route path="new-preview" element={<NewApp />} />
			<Route path="new-editor" element={<NewAppBuilder />} />
		</Routes>
	);
};
