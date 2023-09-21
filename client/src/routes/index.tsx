import { Center, Spinner } from '@chakra-ui/react';
import { Suspense } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Login, Register, ResetPassword } from '@/features/authorization';
import { DashboardLayout } from '@/layout';
import { AppRoutes } from '@/features/app';
import { SourceRoutes } from '@/features/sources';
import { useWorkspaces } from '@/features/workspaces';

export const DashboardRoutes = () => {
	useWorkspaces();

	return (
		<Suspense
			fallback={
				<Center w="full" h="full">
					<Spinner
						thickness="2px"
						speed="0.5s"
						emptyColor="gray.200"
						color="blue.500"
						size="lg"
					/>
				</Center>
			}
		>
			<Routes>
				<Route
					path="/"
					element={
						<DashboardLayout>
							<Outlet />
						</DashboardLayout>
					}
				>
					<Route path="login" element={<Login />} />
					<Route path="register" element={<Register />} />
					<Route path="reset" element={<ResetPassword />} />
					<Route path="apps/*" element={<AppRoutes />} />
					<Route path="source/*" element={<SourceRoutes />} />
					<Route path="*" element={<Navigate to="/apps" />} />
				</Route>
			</Routes>
		</Suspense>
	);
};
