import { Box, Flex, Stack } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';
import { useWorkspaces } from '@/features/workspaces';
import { Navbar } from './Navbar';
import { StatusBar } from './StatusBar';

export const DashboardLayout = ({ children }: PropsWithChildren<any>) => {
	const { pathname } = useLocation();
	const { isSuccess } = useWorkspaces();

	const loginRoutes =
		pathname.startsWith('/login') ||
		pathname.startsWith('/register') ||
		pathname.startsWith('/reset') ||
		pathname.startsWith('/email-confirmation') ||
		pathname.startsWith('/forgot');

	const shouldNotShowStatusBar = loginRoutes || import.meta.env.VITE_APP_TYPE === 'app';

	const shouldNotDisplayNavbar = pathname.startsWith('/apps/') || loginRoutes || !isSuccess;

	return (
		<Stack spacing="0" w="100vw" height="100vh" overflow="hidden" position="relative">
			<Flex maxH="calc(100vh - 20px)" flex="1">
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
