import { Center, Progress, Stack, Text } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';

export const ProtectedRoutes = () => {
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
};
