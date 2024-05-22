import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { Center, Progress, Stack, Text } from '@chakra-ui/react';

import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { AppBuilder } from '@/features/app-builder';

import { useGetWorkspaceApps } from '@/features/app-list/hooks/useGetWorkspaceApps';
import { appModeAtom } from '@/features/app/atoms';

export const AppRoutes = () => {
	const { appName } = useParams();

	const updateMode = useSetAtom(appModeAtom);
	const { pathname } = useLocation();

	const { apps, isFetching: isFetchingApps } = useGetWorkspaceApps();

	useEffect(() => {
		const isEditor = pathname.endsWith('studio');

		updateMode({
			isPreview: !isEditor,
		});
	}, [pathname, updateMode]);

	if (isFetchingApps) {
		return (
			<Center as={Stack} spacing="6" w="full" h="full">
				<Text color="heading" fontSize="lg" fontWeight="medium">
					Fetching apps...
				</Text>
				<Progress minW="sm" size="xs" isIndeterminate />
			</Center>
		);
	}

	const app = apps.find((a) => a.name === appName);

	// Invalid app
	if (!app) {
		return <Navigate to="/" />;
	}

	return (
		<Routes>
			<Route index element={<AppBuilder />} />
			<Route path="studio" element={<AppBuilder />} />
			<Route path="preview" element={<Navigate to=".." />} />
			<Route path="editor" element={<Navigate to="../studio" />} />
		</Routes>
	);
};
