import { Stack, IconButton, Tooltip, Box } from '@chakra-ui/react';

import { LogOut, Grid, Repeat, Settings } from 'react-feather';
import { Link, useLocation } from 'react-router-dom';
import { useLogout } from '@/features/authorization/hooks/useLogout';
import { DropbaseLogo } from '@/components/Logo';
import { useGetCurrentUser } from '@/features/authorization/hooks/useGetUser';
import { isProductionApp } from '../utils';

export const Navbar = () => {
	const { pathname } = useLocation();
	const { mutate: logout } = useLogout();
	const { user } = useGetCurrentUser();

	const handleLogout = () => {
		logout();
	};

	return (
		<Stack w="14" h="full" bg="white" borderRightWidth="1px" p="3" alignItems="center">
			<Stack alignItems="center" h="full">
				<Box mb="8" w="12" as={Link} to="/apps">
					<DropbaseLogo />
				</Box>
				{user?.email?.endsWith('dropbase.io') && (
					<Tooltip label="Workspace Switcher" placement="right">
						<IconButton
							variant="ghost"
							as={Link}
							to="/workspaces"
							color={pathname === '/workspaces' ? 'blue.500' : 'body'}
							colorScheme={pathname === '/workspaces' ? 'blue' : 'gray'}
							aria-label="Apps"
							icon={<Repeat size="22" />}
						/>
					</Tooltip>
				)}

				{isProductionApp() ? null : (
					<Tooltip label="Apps" placement="right">
						<IconButton
							variant="ghost"
							as={Link}
							to="/apps"
							color={pathname === '/apps' ? 'blue.500' : 'body'}
							colorScheme={pathname === '/apps' ? 'blue' : 'gray'}
							aria-label="Apps"
							icon={<Grid size="22" />}
						/>
					</Tooltip>
				)}
				<Stack mt="auto" alignItems="center">
					<Tooltip label="Developer settings" placement="right">
						<IconButton
							variant="ghost"
							as={Link}
							to="/settings/developer"
							color={pathname === '/settings/developer' ? 'blue.500' : 'body'}
							colorScheme={pathname === '/settings/developer' ? 'blue' : 'gray'}
							aria-label="developer settings"
							icon={<Settings size="22" />}
						/>
					</Tooltip>
					<Tooltip label="Logout" placement="right">
						<IconButton
							variant="ghost"
							onClick={handleLogout}
							colorScheme="gray"
							aria-label="Logouts"
							icon={<LogOut size="22" />}
						/>
					</Tooltip>
				</Stack>
			</Stack>
		</Stack>
	);
};
