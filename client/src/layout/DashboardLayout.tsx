import { Box, Flex } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';

import { Navbar } from './Navbar';

export const DashboardLayout = ({ children }: PropsWithChildren<any>) => {
	const { pathname } = useLocation();
	console.log('pathname', pathname.startsWith('/login'));
	const shouldNotDisplayNavbar =
		pathname.startsWith('/apps/') ||
		pathname.startsWith('/login') ||
		pathname.startsWith('/register') ||
		pathname.startsWith('/reset');
	console.log('shouldNotDisplayNavbar', shouldNotDisplayNavbar);
	return (
		<Box height="100vh" overflow="hidden" position="relative">
			<Flex h="full">
				{shouldNotDisplayNavbar ? null : <Navbar />}
				<Box overflowY="auto" flex="1" p="0">
					{children}
				</Box>
			</Flex>
		</Box>
	);
};
