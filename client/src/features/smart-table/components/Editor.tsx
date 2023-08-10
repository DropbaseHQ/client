import MonacoEditor from '@monaco-editor/react';

import { Box, Flex, IconButton, Spinner, Stack, Text } from '@chakra-ui/react';
import { CheckCircle, Play } from 'react-feather';

import { useSQLCompletion } from '@/components/editor';
import { useSchema } from '@/features/smart-table/hooks/useSchema';

export const Editor = () => {
	const { schema, isLoading } = useSchema();

	useSQLCompletion(schema as any);

	return (
		<Stack h="full" spacing="0">
			<MonacoEditor height="100%" language="sql" defaultValue="-- Write your SQL Query" />

			<Stack
				h="12"
				position="sticky"
				bottom="0"
				bg="white"
				direction="row"
				p="2"
				alignItems="center"
				borderTopWidth="0.5px"
				justifyContent="space-between"
			>
				{isLoading ? (
					<Flex alignItems="center">
						<Spinner size="xs" />
						<Text ml="1" fontSize="sm">
							Loading schema...
						</Text>
					</Flex>
				) : (
					<Flex alignItems="center">
						<Box color="green.500">
							<CheckCircle size="14" />
						</Box>
						<Text ml="1" fontSize="sm">
							Schema loaded
						</Text>
					</Flex>
				)}

				<IconButton
					borderRadius="full"
					size="xs"
					aria-label="Search database"
					icon={<Play size="12" />}
				/>
			</Stack>
		</Stack>
	);
};
