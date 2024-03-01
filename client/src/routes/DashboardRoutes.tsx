import { Center, Progress, Spinner, Stack, Text } from '@chakra-ui/react';
import { Suspense } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { lazyImport } from '@/utils/lazy-import';

import { useWorkspaces } from '@/features/workspaces';
import { GithubAuth } from '@/features/authorization/GithubAuth';
import { DashboardLayout } from '@/layout';
import { OnboardingForm } from '@/features/authorization/OnboardingForm';

const { Login } = lazyImport(() => import('@/features/authorization'), 'Login');
const { Register } = lazyImport(() => import('@/features/authorization'), 'Register');
const { ResetPassword } = lazyImport(() => import('@/features/authorization'), 'ResetPassword');
const { EmailConfirmation } = lazyImport(
	() => import('@/features/authorization'),
	'EmailConfirmation',
);
const { RequestResetLink } = lazyImport(
	() => import('@/features/authorization/RequestResetLink'),
	'RequestResetLink',
);

export const DashboardRoutes = ({ homeRoute, children }: any) => {
	const { isLoading } = useWorkspaces();

	if (isLoading) {
		return (
			<DashboardLayout>
				<Center as={Stack} spacing="6" w="full" h="full">
					<Stack alignItems="center" spacing="0">
						<Text color="heading" fontSize="lg" fontWeight="medium">
							Checking user...
						</Text>
					</Stack>
					<Progress minW="sm" size="xs" isIndeterminate />
				</Center>
			</DashboardLayout>
		);
	}

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
							<OnboardingForm />
						</DashboardLayout>
					}
				>
					<Route index element={<Navigate to={homeRoute} />} />
					<Route path="login" element={<Login />} />
					<Route path="register" element={<Register />} />
					<Route path="forgot" element={<RequestResetLink />} />
					<Route path="reset" element={<ResetPassword />} />
					<Route
						path="email-confirmation/:token/:userId"
						element={<EmailConfirmation />}
					/>
					<Route path="github_auth" element={<GithubAuth />} />
					{children}
					<Route path="*" element={<Navigate to={homeRoute} />} />
				</Route>
			</Routes>
		</Suspense>
	);
};
