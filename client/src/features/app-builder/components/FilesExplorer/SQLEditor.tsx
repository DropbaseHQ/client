import {
	Box,
	Button,
	FormControl,
	FormLabel,
	IconButton,
	Skeleton,
	SkeletonCircle,
	Stack,
	Text,
} from '@chakra-ui/react';
import { Play, X, Save } from 'react-feather';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { MonacoEditor } from '@/components/Editor';
import { useFile, useRunSQLQuery, useSaveSql, useSources } from '@/features/app-builder/hooks';
import { newPageStateAtom, useSyncState } from '@/features/app-state';
import { logBuilder } from '@/features/app-builder/utils';
import { ChakraTable } from '@/components/Table';
import { pageAtom, useGetPage } from '@/features/page';
import { InputRenderer } from '@/components/FormInput';
import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';

export const SQLEditor = ({ id }: any) => {
	const toast = useToast();
	const { pageId } = useParams();
	const { files } = useGetPage(pageId);

	const file = files.find((f: any) => f.id === id);
	const sqlName = file?.name;
	const { pageName, appName } = useAtomValue(pageAtom);

	const [selectedSource, setSource] = useState();

	const fullFileName = file ? `${sqlName}.${file?.type}` : null;
	const {
		isLoading,
		code: defaultCode,
		refetch,
	} = useFile({
		pageName,
		appName,
		fileName: fullFileName,
	});

	const [code, setCode] = useState('');
	const [log, setLog] = useState<any>(null);
	const [previewData, setPreviewData] = useState<any>(null);

	const { sources, isLoading: isLoadingSources } = useSources();

	const pageState = useAtomValue(newPageStateAtom);

	const syncState = useSyncState();

	useEffect(() => {
		setSource(file?.source);
	}, [setSource, file]);

	useEffect(() => {
		setLog(null);
		setPreviewData(null);
	}, [id]);

	useEffect(() => {
		setCode(defaultCode);
	}, [defaultCode, id]);

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
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to run query',
				description: getErrorMessage(error),
			});
		},
		onMutate: () => {
			setLog(null);
			setPreviewData(null);
		},
	});

	const saveSQLMutation = useSaveSql({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'Updated SQL',
			});
			refetch();
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to update SQL',
				description: getErrorMessage(error),
			});
		},
	});

	const handleRun = () => {
		runMutation.mutate({
			pageName,
			appName,
			state: pageState.state,
			fileName: sqlName,
			fileContent: code,
			source: selectedSource,
		});
	};

	const handleSave = () => {
		saveSQLMutation.mutate({
			pageName,
			appName,
			fileName: sqlName,
			sql: code,
			source: selectedSource,
			fileId: id,
			fileType: file?.type,
		});
	};

	const resetRunData = () => {
		setLog(null);
		setPreviewData(null);
	};

	if (isLoading || isLoadingSources) {
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
		<Stack bg="white" h="full" spacing="3">
			<Stack p="3" borderBottomWidth="1px" alignItems="start" direction="row">
				<FormControl>
					<FormLabel>Source</FormLabel>
					<InputRenderer
						size="sm"
						flex="1"
						maxW="sm"
						type="select"
						placeholder="Sources"
						value={selectedSource}
						options={sources.map((s) => ({ name: s, value: s }))}
						onChange={(newSelectedSource: any) => {
							setSource(newSelectedSource);
						}}
					/>
				</FormControl>
				<Button
					w="fit-content"
					isLoading={saveSQLMutation.isLoading}
					onClick={handleSave}
					variant="outline"
					colorScheme="gray"
					size="sm"
					isDisabled={code === defaultCode && file?.source === selectedSource}
					leftIcon={<Save size="14" />}
				>
					Update
				</Button>
			</Stack>
			<Stack
				px="2"
				pb="2"
				pt=".5"
				borderBottomWidth="1px"
				spacing="0"
				alignItems="start"
				direction="row"
			>
				<IconButton
					icon={<Play size="14" />}
					variant="outline"
					size="xs"
					colorScheme="gray"
					aria-label="Run code"
					borderRadius="full"
					isLoading={runMutation.isLoading}
					onClick={handleRun}
					isDisabled={!selectedSource}
					flexShrink="0"
				/>

				<MonacoEditor value={code} onChange={setCode} language="sql" />
			</Stack>

			<Stack h="full" overflow="auto">
				{log ? (
					<Stack
						borderBottomWidth="1px"
						bg="white"
						p="2"
						w="full"
						flex="1"
						h="full"
						overflow="auto"
						borderRadius="sm"
					>
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

							<Stack w="full" overflow="auto">
								<Text fontSize="sm" letterSpacing="wide" fontWeight="medium">
									Output
								</Text>
								<Box
									borderWidth="1px"
									borderColor="blackAlpha.100"
									borderRadius="sm"
								>
									<MonacoEditor
										value={log}
										language="shell"
										options={{ lineNumbers: 'off', readOnly: true }}
									/>
								</Box>
							</Stack>
						</Stack>
					</Stack>
				) : null}

				{previewData?.columns ? (
					<Box px="3" w="full" pb="3" borderBottomWidth="1px">
						<ChakraTable {...previewData} maxH="md" borderRadius="sm" />
					</Box>
				) : null}
			</Stack>
		</Stack>
	);
};
