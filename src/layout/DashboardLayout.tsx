import { Box, Flex, Stack } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';
import { StatusBar } from './StatusBar';

export const DashboardLayout = ({ children }: PropsWithChildren<any>) => {
	return (
		<Stack spacing="0" w="100vw" height="100vh" overflow="hidden" position="relative">
			<Flex maxH="calc(100vh - 20px)" flex="1">
				<Box overflowY="auto" flex="1" p="0">
					{children}
				</Box>
			</Flex>
			<Box maxH="20px" flexShrink="0">
				<StatusBar />
			</Box>
		</Stack>
	);
};
