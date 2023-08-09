import { useSqlMonaco } from '@/hooks/useSqlMonaco';
import { Box, Flex } from '@chakra-ui/react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { PropsWithChildren, useEffect } from 'react';

export const DashboardLayout = ({ children }: PropsWithChildren<any>) => {
	const monaco = useMonaco();
	const { setupMonaco } = useSqlMonaco({ public: { customers: ['id', 'test'] } });

	useEffect(() => {
		if (monaco) {
			setupMonaco(monaco);
		}
	}, [monaco, setupMonaco]);

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
