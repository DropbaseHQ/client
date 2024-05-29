import { Box, Flex, Stack } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { StatusBar } from './StatusBar';
import { isFreeApp } from '@/utils';

export const DashboardLayout = ({ children }: PropsWithChildren<any>) => {
	const { pathname } = useLocation();

	const loginRoutes =
		pathname.startsWith('/login') ||
		pathname.startsWith('/register') ||
		pathname.startsWith('/reset') ||
		pathname.startsWith('/email-confirmation') ||
		pathname.startsWith('/forgot');

	const welcomePage = pathname.startsWith('/welcome');

	const shouldNotShowStatusBar =
		loginRoutes || welcomePage || import.meta.env.VITE_APP_TYPE === 'app';

	const shouldNotDisplayNavbar = isFreeApp()
		? pathname.startsWith('/apps/')
		: pathname.startsWith('/apps/') || loginRoutes;

	return (
		<Stack spacing="0" w="100vw" height="100vh" overflow="hidden" position="relative">
			<Flex maxH={shouldNotShowStatusBar ? '100vh' : 'calc(100vh - 20px)'} flex="1">
				{shouldNotDisplayNavbar ? null : <Navbar />}
				<Box overflowY="auto" flex="1" p="0">
					{children}
				</Box>
			</Flex>
			{shouldNotShowStatusBar ? null : (
				<Box maxH="20px" flexShrink="0">
					<StatusBar />
				</Box>
			)}
		</Stack>
	);
};
