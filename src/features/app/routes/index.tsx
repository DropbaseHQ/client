import { Navigate, Route, Routes } from 'react-router-dom';
import { AppRoutes } from './AppRoutes';
import { AppList } from '@/features/app-list';
import { OnboardingModal } from '@/features/app/components/OnboardingModal';

export const App = () => {
	return (
		<>
			<Routes>
				<Route index element={<AppList />} />
				<Route path=":appName/:pageName/*" element={<AppRoutes />} />
				<Route path="*" element={<Navigate to="." />} />
			</Routes>
			<OnboardingModal />
		</>
	);
};
