import { Center, Spinner } from '@chakra-ui/react';
import { Suspense, useEffect } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { lazyImport } from '@/utils/lazy-import';

import { GithubAuth } from '@/features/authorization/GithubAuth';
import { DashboardLayout } from '@/layout';
import { OnboardingForm } from '@/features/authorization/OnboardingForm';
import { Intro } from '@/features/intro';

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
	useEffect(() => {
		let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
		if (!link) {
			link = document.createElement('link') as HTMLLinkElement;
			link.rel = 'shortcut icon';
			document.getElementsByTagName('head')[0].appendChild(link);
		}
		link.type = 'image/x-icon';
		if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			link.href = '/favicon-dark.ico';
		} else {
			link.href = '/favicon-light.ico';
		}
		if (window.location.hostname === 'localhost') {
			link.href = '/favicon-dev.ico';
		}
	}, []);

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
					<Route path="intro" element={<Intro />} />
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
