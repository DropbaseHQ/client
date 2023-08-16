import { Box, Flex, IconButton, Spinner, Stack, Text } from '@chakra-ui/react';
import MonacoEditor from '@monaco-editor/react';
import { useEffect, useState } from 'react';
import { CheckCircle, Play } from 'react-feather';
import { useParams } from 'react-router-dom';

import { useSQLCompletion } from '@/components/Editor';
import { useGetApp } from '@/features/app/hooks';
import { useSchema } from '@/features/smart-table/hooks/useSchema';
import { useCreateSql } from '../hooks/useCreateSql';
import { useTableData } from '../hooks/useTableData';
import { useUpdateSql } from '../hooks/useUpdateSql';

export const Editor = () => {
	const { schema, isLoading } = useSchema();
	const { appId } = useParams();
	const { refetch, isLoading: tableDataIsLoading } = useTableData(appId);

	const { sql } = useGetApp(appId || '');
	const createSqlMutation = useCreateSql();
	const updateSqlMutation = useUpdateSql();
	const [code, setCode] = useState(sql?.code);

	useSQLCompletion(schema as any);

	useEffect(() => {
		setCode(sql?.code);
	}, [sql?.code]);

	const handleQueryDatabase = async () => {
		if (sql) {
			await updateSqlMutation.mutateAsync({ sqlsId: sql.id || '', code: code || '' });
		} else {
			await createSqlMutation.mutateAsync({ appId: appId || '', code: code || '' });
		}
		refetch();
	};
	const handleCodeChange = (newCode?: string) => {
		setCode(newCode || '');
	};

	return (
		<Stack h="full" spacing="0">
			<MonacoEditor
				height="100%"
				language="sql"
				defaultValue="-- Write your SQL Query"
				value={code}
				onChange={handleCodeChange}
			/>

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
					isLoading={
						createSqlMutation.isLoading ||
						updateSqlMutation.isLoading ||
						tableDataIsLoading
					}
					onClick={handleQueryDatabase}
				/>
			</Stack>
		</Stack>
	);
};
