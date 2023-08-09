import { Box, Image, Stack } from '@chakra-ui/react';

export const Navbar = () => {
	return (
		<Stack w="14" h="full" borderRightWidth="1px" p="3" alignItems="center">
			<Box>
				<Image w="full" src="/vite.svg" />
			</Box>
		</Stack>
	);
};
