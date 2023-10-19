import { Button, Code, IconButton, Skeleton, SkeletonCircle, Stack, Text } from '@chakra-ui/react';
import { Play, X } from 'react-feather';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';

import { MonacoEditor } from '@/components/Editor';
import { useFile, useRunSQLQuery } from '@/features/new-app-builder/hooks';
import { newPageStateAtom, useSyncState } from '@/features/new-app-state';
import { logBuilder } from '@/features/new-app-builder/utils';
import { ChakraTable } from '@/components/Table';
import { pageAtom } from '@/features/new-page';

export const SQLEditor = ({ id }: any) => {
	const sqlName = id.split('/').pop();
	const { pageName, appName } = useAtomValue(pageAtom);

	const { isLoading, code: defaultCode } = useFile({
		pageName,
		appName,
		fileName: sqlName,
	});

	const [code, setCode] = useState('');
	const [log, setLog] = useState<any>(null);
	const [previewData, setPreviewData] = useState<any>(null);

	const pageState = useAtomValue(newPageStateAtom);

	const syncState = useSyncState();

	const runMutation = useRunSQLQuery({
		onSuccess: (data: any) => {
			syncState(data);
			setLog(logBuilder(data));

			if (data?.result?.columns) {
				setPreviewData({
					rows: data?.result?.data || [],
					columns: data?.result?.columns || [],
				});
			}
		},
		onMutate: () => {
			setLog(null);
			setPreviewData(null);
		},
	});

	const handleRun = () => {
		runMutation.mutate({
			pageName,
			appName,
			pageState,
			fileName: sqlName,
			fileContent: code,
		});
	};

	const resetRunData = () => {
		setLog(null);
		setPreviewData(null);
	};

	useEffect(() => {
		setCode(defaultCode);
	}, [defaultCode]);

	if (isLoading) {
		return (
			<Stack p="3" spacing="2">
				<Skeleton startColor="gray.200" endColor="gray.300" h="32" />
				<Stack direction="row">
					<SkeletonCircle h="10" w="10" />
					<Skeleton startColor="gray.200" w="full" endColor="gray.300" h="10" />
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack p="3" spacing="3">
			<MonacoEditor value={code} onChange={setCode} language="sql" />

			<Button
				variant="outline"
				w="fit-content"
				size="sm"
				isLoading={runMutation.isLoading}
				onClick={handleRun}
				leftIcon={<Play size="14" />}
			>
				Run Query
			</Button>

			{log ? (
				<Stack bg="white" p="2" h="full" borderRadius="sm">
					<Stack direction="row" alignItems="start">
						<IconButton
							aria-label="Close output"
							size="xs"
							colorScheme="gray"
							variant="outline"
							borderRadius="full"
							icon={<X size={14} />}
							onClick={resetRunData}
						/>

						<Stack>
							<Text fontSize="sm" letterSpacing="wide" fontWeight="medium">
								Output
							</Text>
							<Code
								w="full"
								color="gray.500"
								backgroundColor="inherit"
								overflow="auto"
								height={`${(log?.split('\n').length || 1) * 24}px`}
							>
								<pre>{log}</pre>
							</Code>
						</Stack>
					</Stack>
				</Stack>
			) : null}

			{previewData?.columns ? (
				<ChakraTable {...previewData} maxH="md" borderRadius="sm" />
			) : null}

			{/* <DeleteFunction
				w="fit-content"
				mt="4"
				variant="outline"
				functionId={id}
				functionName={functionName}
			/> */}
		</Stack>
	);
};
