import { Navigate, Route, Routes } from 'react-router-dom';
import { Center, Progress, Stack, Text } from '@chakra-ui/react';

import { AppBuilder } from '@/features/app-builder';
import { App } from '../components';
import { useSyncProxyToken } from '@/features/settings/hooks/token';

export const AppRoutes = () => {
	const { isLoading: isLoadingTokens } = useSyncProxyToken();

	if (isLoadingTokens) {
		return (
			<Center as={Stack} spacing="6" w="full" h="full">
				<Text color="heading" fontSize="lg" fontWeight="medium">
					Validating token...
				</Text>
				<Progress minW="sm" size="xs" isIndeterminate />
			</Center>
		);
	}

	return (
		<Routes>
			<Route index element={<App />} />
			<Route path="studio" element={<AppBuilder />} />
			<Route path="preview" element={<Navigate to=".." />} />
			<Route path="editor" element={<Navigate to="../studio" />} />
		</Routes>
	);
};
