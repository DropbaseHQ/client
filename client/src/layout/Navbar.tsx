import {
	Stack,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	IconButton,
	Tooltip,
	Box,
} from '@chakra-ui/react';

import { useGetCurrentUser } from '@/features/authorization/hooks/useGetUser';
import { Settings, LogOut, Grid, Database, Repeat, Users, Lock } from 'react-feather';
import { Link, useLocation } from 'react-router-dom';
import { workspaceAtom } from '@/features/workspaces';
import { useAtomValue } from 'jotai';
import { useLogout } from '@/features/authorization/hooks/useLogout';
import { DropbaseLogo } from '@/components/Logo';
import { useGetWorkspaceUsers } from '@/features/settings/hooks/useGetUsers';

export const Navbar = () => {
	const { pathname } = useLocation();
	const { mutate: logout } = useLogout();
	const workspaceId = useAtomValue(workspaceAtom);
	const { user } = useGetCurrentUser();
	const { users } = useGetWorkspaceUsers({ workspaceId: workspaceId || '' });
	const userRole = users?.find((u: any) => u.user_id === user?.id)?.role_name;

	// const { colorMode, toggleColorMode } = useColorMode();;
	const userHasRole = (roles: string[]) => {
		return roles.includes(userRole);
	};
	const handleLogout = () => {
		logout();
	};

	return (
		<Stack w="14" h="full" bg="white" borderRightWidth="1px" p="3" alignItems="center">
			<Stack alignItems="center" h="full">
				<Box mb="8" w="12" as={Link} to="/apps">
					<DropbaseLogo />
				</Box>
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
				{userHasRole(['admin', 'dev']) && (
					<Tooltip label="Sources" placement="right">
						<IconButton
							variant="ghost"
							as={Link}
							to="/source"
							color={pathname === '/source' ? 'blue.500' : 'body'}
							colorScheme={pathname === '/source' ? 'blue' : 'gray'}
							aria-label="Sources"
							icon={<Database size="22" />}
						/>
					</Tooltip>
				)}

				{userHasRole(['admin']) && (
					<Tooltip label="Members" placement="right">
						<IconButton
							variant="ghost"
							as={Link}
							to="/settings/members"
							color={pathname === '/settings/members' ? 'blue.500' : 'body'}
							colorScheme={pathname === '/settings/members' ? 'blue' : 'gray'}
							aria-label="Members"
							icon={<Users size="22" />}
						/>
					</Tooltip>
				)}

				{userHasRole(['admin']) && (
					<Tooltip label="Permissions" placement="right">
						<IconButton
							variant="ghost"
							as={Link}
							to="/settings/permissions"
							color={pathname === '/settings/permissions' ? 'blue.500' : 'body'}
							colorScheme={pathname === '/settings/permissions' ? 'blue' : 'gray'}
							aria-label="Permissions"
							icon={<Lock size="22" />}
						/>
					</Tooltip>
				)}

				<Stack mt="auto" alignItems="center">
					{/* <Tooltip
						label={`Toggle to ${colorMode === 'dark' ? 'light' : 'dark'} theme`}
						placement="right"
					>
						<IconButton
							variant="ghost"
							colorScheme="gray"
							onClick={toggleColorMode}
							aria-label="Toggle theme"
							icon={colorMode === 'dark' ? <Sun size="22" /> : <Moon size="22" />}
						/>
					</Tooltip> */}
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
		</Stack>
	);
};
