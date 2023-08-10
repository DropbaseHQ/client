import { useSqlMonaco } from '@/hooks/useSqlMonaco';
import { Box, Flex } from '@chakra-ui/react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { PropsWithChildren } from 'react';

export const DashboardLayout = ({ children }: PropsWithChildren<any>) => {
	const monaco = useMonaco();
	useSqlMonaco(monaco, { public: { customers: ['id', 'test'] } });

	return (
		<Box height="100vh" overflow="hidden" position="relative">
			<Flex h="full">
				<nav>navbar</nav>

				<Box overflowY="auto" flex="1" p="0">
					{children}
				</Box>
				<Editor language="sql" height="90vh" />
			</Flex>
		</Box>
	);
};
