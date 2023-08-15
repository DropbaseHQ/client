import { Route, Routes } from 'react-router-dom';

import { AppBuilder } from '@/features/app-builder';
import { SmartTable } from '@/features/smart-table';

export const App = () => {
	return (
		<Routes>
			<Route index element={<SmartTable />} />
			<Route path="editor" element={<AppBuilder />} />
		</Routes>
	);
};
