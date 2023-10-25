import { Navigate, Route, Routes } from 'react-router-dom';
import { Center, Progress, Stack, Text } from '@chakra-ui/react';

import { NewAppBuilder } from '@/features/new-app-builder';
import { NewApp } from '../components';
import { useSyncProxyToken } from '@/features/settings/hooks/token';

export const App = () => {
	const { isLoading: isLoadingTokens, isValid: isValidToken } = useSyncProxyToken();

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

	if (!isValidToken) {
		return <Navigate to="/settings/developer" />;
	}

	return (
		<Routes>
			<Route index element={<NewAppBuilder />} />
			<Route path="editor" element={<Navigate to="new-editor" />} />
			<Route path="preview" element={<Navigate to="new-preview" />} />
			<Route path="new-preview" element={<NewApp />} />
			<Route path="new-editor" element={<NewAppBuilder />} />
		</Routes>
	);
};
