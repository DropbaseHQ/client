import { Box, Flex } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';

export const DashboardLayout = ({ children }: PropsWithChildren<any>) => {
	return (
		<Box height="100vh" overflow="hidden" position="relative">
			<Flex h="full">
				<nav>navbar</nav>

				<Box overflowY="auto" flex="1" p="6">
					{children}
				</Box>
			</Flex>
		</Box>
	);
};
