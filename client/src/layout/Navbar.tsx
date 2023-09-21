import { Box, Stack, Flex, LinkBox, LinkOverlay, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import {
	Menu as MenuIcon,
	Code,
	Database,
	Settings,
	LogOut } from 'react-feather';
import { useLogout } from '@/features/authorization/hooks/useLogout';

export const Navbar = () => {
	const { mutate: logout } = useLogout();
	const handleLogout = () => {
		logout();
	};
	return (
		<Stack w="14" h="full" borderRightWidth="1px" p="3" alignItems="center">
			<Flex h="100%" direction="column" justifyContent="space-between">
				<MenuIcon size="32" />
				<LinkBox mt="1vw">
					<LinkOverlay href="/apps">
						<Code size="32" />
					</LinkOverlay>
				</LinkBox>
				<LinkBox mt="1vw">
					<LinkOverlay href="/source">
						<Database size="32" />
					</LinkOverlay>
				</LinkBox>
				<Box mt="auto">
					<Menu>
						<MenuButton>
							<Settings size="32" />
						</MenuButton>
						<MenuList>
							<MenuItem icon={<LogOut size="14" />} onClick={handleLogout}>
								Logout
							</MenuItem>
						</MenuList>
					</Menu>
				</Box>
			</Flex>
		</Stack>
	);
};
