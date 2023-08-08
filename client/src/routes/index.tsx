import { Center, Heading, Spinner } from '@chakra-ui/react';
import { Suspense } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';

import { DashboardLayout } from '@/layout';

export const AppRoutes = () => {
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
					<Route index element={<Heading>Home</Heading>} />
					<Route path="*" element={<Heading>404 page not defined</Heading>} />
				</Route>
			</Routes>
		</Suspense>
	);
};
