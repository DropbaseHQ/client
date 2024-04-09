import { Stack, IconButton, Tooltip, Box } from '@chakra-ui/react';

import { LogOut, Grid } from 'react-feather';
import { Link, useLocation } from 'react-router-dom';
import { useLogout } from '@/features/authorization/hooks/useLogout';
import { DropbaseLogo } from '@/components/Logo';
import { isProductionApp } from '../utils';

export const Navbar = () => {
	const { pathname } = useLocation();
	const { mutate: logout } = useLogout();

	const handleLogout = () => {
		logout();
	};

	return (
		<Stack w="14" h="full" bg="white" borderRightWidth="1px" p="3" alignItems="center">
			<Stack alignItems="center" h="full">
				<Box mb="8" w="12" as={Link} to="/apps" display="flex" flexDirection="column">
					<DropbaseLogo />
				</Box>

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
