import { Route, Routes } from 'react-router-dom';

import { AppBuilder } from '@/features/app-builder';
import { SmartTable } from '@/features/smart-table';
import { AppPreview } from '@/features/app-preview';

export const App = () => {
	return (
		<Routes>
			<Route index element={<SmartTable />} />
			<Route path="editor" element={<AppBuilder />} />
			<Route path="preview" element={<AppPreview />} />
		</Routes>
	);
};
