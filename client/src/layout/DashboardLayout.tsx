import { Box, Flex } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';

import { Navbar } from './Navbar';

export const DashboardLayout = ({ children }: PropsWithChildren<any>) => {
	const { pathname } = useLocation();

	return (
		<Box height="100vh" overflow="hidden" position="relative">
			<Flex h="full">
				{pathname.startsWith('/apps/') ? null : <Navbar />}
				<Box overflowY="auto" flex="1" p="0">
					{children}
				</Box>
			</Flex>
		</Box>
	);
};
