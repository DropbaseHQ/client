import { Stack, Menu, MenuButton, MenuList, MenuItem, IconButton } from '@chakra-ui/react';
import { Settings, LogOut, Grid, Database } from 'react-feather';
import { Link, useLocation } from 'react-router-dom';

import { useLogout } from '@/features/authorization/hooks/useLogout';

export const Navbar = () => {
	const { pathname } = useLocation();
	const { mutate: logout } = useLogout();

	const handleLogout = () => {
		logout();
	};

	return (
		<Stack w="14" h="full" bg="white" borderRightWidth="1px" p="3" alignItems="center">
			<Stack alignItems="center" h="full">
				<IconButton
					variant="ghost"
					as={Link}
					to="/apps"
					color={pathname === '/apps' ? 'blue.500' : 'body'}
					colorScheme={pathname === '/apps' ? 'blue' : 'gray'}
					aria-label="Apps"
					icon={<Grid size="22" />}
				/>

				<IconButton
					variant="ghost"
					as={Link}
					to="/source"
					color={pathname === '/source' ? 'blue.500' : 'body'}
					colorScheme={pathname === '/source' ? 'blue' : 'gray'}
					aria-label="Sources"
					icon={<Database size="22" />}
				/>

				<Menu>
					<MenuButton mt="auto">
						<Settings size="22" />
					</MenuButton>
					<MenuList>
						<MenuItem icon={<LogOut size="14" />} onClick={handleLogout}>
							Logout
						</MenuItem>
					</MenuList>
				</Menu>
			</Stack>
		</Stack>
	);
};
