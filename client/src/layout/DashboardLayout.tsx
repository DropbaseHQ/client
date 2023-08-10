import { PropsWithChildren } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Editor from '@monaco-editor/react';
import { useSqlMonaco } from '@/hooks/useSqlMonaco';

export const DashboardLayout = ({ children }: PropsWithChildren<any>) => {
	useSqlMonaco({ public: { customers: ['id', 'test'] } });

	return (
		<Box height="100vh" overflow="hidden" position="relative">
			<Flex h="full">
				<nav>navbar</nav>

				<Box overflowY="auto" flex="1" p="0">
					{children}
				</Box>
				<Editor height="90vh" />
			</Flex>
		</Box>
	);
};
