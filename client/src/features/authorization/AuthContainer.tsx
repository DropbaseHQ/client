import { Center, Progress, Stack, Text } from '@chakra-ui/react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useWorkspaces } from '@/features/workspaces';

export const ProtectedRoutes = () => {
	const navigate = useNavigate();
	const { isLoading, isSuccess } = useWorkspaces();

	const isAuthenticated = isSuccess;

	if (isLoading)
		return (
			<Center as={Stack} spacing="6" w="full" h="full">
				<Stack alignItems="center" spacing="0">
					<Text color="heading" fontSize="lg" fontWeight="medium">
						Checking user...
					</Text>
				</Stack>
				<Progress minW="sm" size="xs" isIndeterminate />
			</Center>
		);

	if (!isLoading && !isAuthenticated) navigate('/login');

	return <Outlet />;
};
