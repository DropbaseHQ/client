import { Box, IconButton, Skeleton, SkeletonCircle, Stack, Text } from '@chakra-ui/react';
import { Play, X } from 'react-feather';
import * as monacoLib from 'monaco-editor';
import { useAtom, useAtomValue } from 'jotai';

import { useMonaco } from '@monaco-editor/react';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { MonacoEditor } from '@/components/Editor';
import { useRunFunction, useRunSQLQuery } from '@/features/app-builder/hooks';
import { newPageStateAtom, useSyncState } from '@/features/app-state';
import {
	MODEL_PATH,
	MODEL_SCHEME,
	findFunctionDeclarations,
	generateFunctionCallSuggestions,
	logBuilder,
} from '@/features/app-builder/utils';
import { useGetPage } from '@/features/page';
import { ChakraTable } from '@/components/Table';
import { previewCodeAtom } from '../../atoms';
import { getErrorMessage } from '@/utils';
import { useToast } from '@/lib/chakra-ui';

export const FunctionTerminal = ({ panelRef }: any) => {
	const [{ code, name, source, execute }, setPreviewCode] = useAtom(previewCodeAtom);

	const toast = useToast();

	const { appName, pageName } = useParams();

	const { files, isLoading: isLoadingFiles } = useGetPage({ appName, pageName });
	const file = files.find((f: any) => f.name === name);

	const monaco = useMonaco();

	const [testCode, setTestCode] = useState('');
	const [log, setLog] = useState<any>(null);
	const [previewData, setPreviewData] = useState<any>(null);

	const pageState = useAtomValue(newPageStateAtom);
	const syncState = useSyncState();

	const resetRunData = () => {
		setLog(null);
		setPreviewData(null);
	};

	useEffect(() => {
		resetRunData();
		setTestCode('');
	}, [name]);

	const runHandlers = {
		onSuccess: (data: any) => {
			syncState(data);
			setLog(logBuilder(data));

			if (panelRef?.current?.getSize() < 20) {
				panelRef?.current?.resize(70);
			}

			if (data?.result?.columns) {
				setPreviewData({
					rows: data?.result?.data || [],
					columns: data?.result?.columns || [],
				});
			}
		},
		onMutate: () => {
			resetRunData();
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to run query',
				description: getErrorMessage(error),
			});
		},
	};

	const runPythonMutation = useRunFunction({
		...runHandlers,
	});

	const runSQLQueryMutation = useRunSQLQuery({
		...runHandlers,
	});

	useEffect(() => {
		if (!monaco || file?.type === 'sql') {
			return () => {};
		}

		const { dispose } = (monaco as any).languages.registerCompletionItemProvider('python', {
			triggerCharacters: ['.', '"'],
			provideCompletionItems: (
				model: monacoLib.editor.ITextModel,
				position: monacoLib.Position,
			) => {
				return generateFunctionCallSuggestions(
					model,
					position,
					findFunctionDeclarations(code),
				);
			},
		});

		return () => {
			dispose();
		};
	}, [monaco, file, code]);

	const handleRunPythonFunction = useCallback(() => {
		if (testCode) {
			runPythonMutation.mutate({
				pageName,
				appName,
				pageState,
				code: testCode,
				file,
			});
		} else {
			const declarations = findFunctionDeclarations(code);
			const defaultTestCode = declarations.find((d) => d?.name === file?.name)?.call || '';

			setTestCode(defaultTestCode);

			runPythonMutation.mutate({
				pageName,
				appName,
				pageState,
				code: defaultTestCode,
				file,
			});
		}
	}, [appName, code, file, pageName, pageState, runPythonMutation, testCode]);

	const handleRunSQLQuery = useCallback(() => {
		runSQLQueryMutation.mutate({
			pageName,
			appName,
			state: pageState.state,
			fileName: file?.name,
			fileContent: code,
			source,
		});
	}, [pageName, appName, pageState, file, code, source, runSQLQueryMutation]);

	const executeShortcut = useCallback(() => {
		if (file && !runPythonMutation.isLoading && !runSQLQueryMutation.isLoading) {
			setPreviewCode((old: any) => ({ ...old, execute: false }));
			if (file?.type === 'sql') {
				handleRunSQLQuery();
			} else {
				handleRunPythonFunction();
			}
		}
	}, [
		file,
		setPreviewCode,
		runPythonMutation,
		runSQLQueryMutation,
		handleRunPythonFunction,
		handleRunSQLQuery,
	]);

	const handleKeyDown = useCallback(
		(e: any) => {
			if (e.key === 'Shift' && e.metaKey) {
				executeShortcut();
			}
		},
		[executeShortcut],
	);

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [handleKeyDown]);

	useEffect(() => {
		if (execute) {
			executeShortcut();
		}
	}, [execute, executeShortcut]);

	const isLoading = runPythonMutation.isLoading || runSQLQueryMutation.isLoading;

	if (isLoadingFiles) {
		<Stack direction="row">
			<SkeletonCircle h="10" w="10" />
			<Skeleton startColor="gray.200" w="full" endColor="gray.300" h="10" />
		</Stack>;
	}

	return (
		<Stack w="full" h="full" spacing="1">
			<Stack bg="gray.50" px="2" py="1" borderBottomWidth="1px">
				<Text fontWeight="medium" fontSize="sm">
					Test Code
				</Text>
			</Stack>
			<Stack
				borderBottomWidth="1px"
				bg="white"
				p="2"
				spacing="0"
				alignItems="start"
				direction="row"
				mb={0}
			>
				<IconButton
					icon={<Play size="14" />}
					variant="outline"
					size="xs"
					colorScheme="gray"
					aria-label="Run code"
					borderRadius="full"
					isLoading={isLoading}
					onClick={file?.type === 'sql' ? handleRunSQLQuery : handleRunPythonFunction}
					isDisabled={file?.type === 'sql' ? !(code && source) : !testCode}
					flexShrink="0"
				/>

				{file?.type === 'sql' ? (
					<Text py="1" px="4" color="gray.700" fontSize="sm">
						Click play to see query results
					</Text>
				) : (
					<MonacoEditor
						value={testCode}
						onChange={setTestCode}
						language="python"
						path={`${MODEL_SCHEME}:${MODEL_PATH}`}
					/>
				)}
			</Stack>

			<Stack h="full" overflowY="auto">
				{log ? (
					<Stack
						borderBottomWidth="1px"
						bg="white"
						p="2"
						w="full"
						h="full"
						borderRadius="sm"
					>
						<Stack h="full" direction="row" alignItems="start">
							<IconButton
								aria-label="Close output"
								size="xs"
								colorScheme="gray"
								variant="outline"
								borderRadius="full"
								icon={<X size={14} />}
								onClick={() => setLog(null)}
							/>

							<Stack w="full" h="full">
								<Text fontSize="sm" letterSpacing="wide" fontWeight="medium">
									Output
								</Text>
								<Box
									borderWidth="1px"
									borderColor="blackAlpha.100"
									borderRadius="sm"
									h="full"
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
					<Box px="3" w="full" mt="3" pb="3" borderBottomWidth="1px">
						<ChakraTable
							{...previewData}
							columns={previewData?.columns?.map((c: any) => c.name)}
							maxH="md"
							borderRadius="sm"
						/>
					</Box>
				) : null}
			</Stack>
		</Stack>
	);
};
