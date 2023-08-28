import { Box, Code, Flex, IconButton, Spinner, Stack, Text } from '@chakra-ui/react';
import MonacoEditor from '@monaco-editor/react';
import { useEffect, useState } from 'react';
import { CheckCircle, Play } from 'react-feather';
import { useParams } from 'react-router-dom';

import { useSQLCompletion } from '@/components/Editor';
import { useGetPage } from '@/features/app/hooks';
import { useSchema } from '@/features/smart-table/hooks/useSchema';
import { useToast } from '@/lib/chakra-ui';
import { useCreateSql } from '../hooks/useCreateSql';
import { useTableData } from '../hooks/useTableData';
import { useUpdateSql } from '../hooks/useUpdateSql';

export const Editor = () => {
	const { pageId } = useParams();
	const { schema, isLoading } = useSchema(pageId || '');
	const { refetch, isLoading: tableDataIsLoading } = useTableData({ pageId });
	const [sqlError, setSqlError] = useState<{ message: string; details: string | null } | null>(
		null,
	);

	const { sql } = useGetPage(pageId || '');
	const toast = useToast();
	const createSqlMutation = useCreateSql({
		onSuccess: () => {
			toast({
				title: 'SQL query updated',
				status: 'success',
			});
			setSqlError(null);
		},
		onError: (err) => {
			setSqlError(err?.response?.data?.detail);
		},
	});
	const updateSqlMutation = useUpdateSql({
		onSuccess: () => {
			toast({
				title: 'SQL query updated',
				status: 'success',
			});
			setSqlError(null);
		},
		onError: (err) => {
			setSqlError(err?.response?.data?.detail);
		},
	});
	const [code, setCode] = useState(sql?.code);

	useSQLCompletion(schema as any);

	useEffect(() => {
		setCode(sql?.code);
	}, [sql?.code]);

	const handleQueryDatabase = async () => {
		if (sql?.code) {
			await updateSqlMutation.mutateAsync({ sqlsId: sql.id || '', code: code || '' });
		} else {
			await createSqlMutation.mutateAsync({ pageId: pageId || '', code: code || '' });
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
				position="sticky"
				bottom="0"
				bg="white"
				direction="column"
				p="2"
				alignItems="center"
				borderTopWidth="0.5px"
				justifyContent="space-between"
			>
				<Stack direction="row" w="full" justifyContent="space-between">
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
				{sqlError?.message && (
					<Code w="full" background="white" color="red">
						ERROR: {sqlError.message}
					</Code>
				)}
				{sqlError?.details && (
					<Code w="full" background="white" color="red">
						{sqlError.details.split('\n').map((line, index) => (
							<pre key={index}>{line}</pre>
						))}
					</Code>
				)}
			</Stack>
		</Stack>
	);
};
