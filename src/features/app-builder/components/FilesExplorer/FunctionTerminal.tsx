import { Box, IconButton, Skeleton, SkeletonCircle, Stack, Text } from '@chakra-ui/react';
import { Play, X } from 'react-feather';
import * as monacoLib from 'monaco-editor';
import { useAtom, useAtomValue } from 'jotai';

import { useMonaco } from '@monaco-editor/react';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { MonacoEditor } from '@/components/Editor';
import { useRunFunction, useRunSQLQuery } from '@/features/app-builder/hooks';
import { pageStateAtom, useSyncState } from '@/features/app-state';
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
	const [{ code, name, execute }, setPreviewCode] = useAtom(previewCodeAtom);

	const toast = useToast();

	const { appName, pageName } = useParams();

	const { files, isLoading: isLoadingFiles } = useGetPage({ appName, pageName });
	const file = files.find((f: any) => f.name === name);

	const monaco = useMonaco();

	const [testCode, setTestCode] = useState('');
	const [log, setLog] = useState<any>(null);
	const [previewData, setPreviewData] = useState<any>(null);
	const [previewDataType, setPreviewDataType] = useState<any>(null);

	const [testCodeHeight, setTestCodeHeight] = useState(16);

	const pageState = useAtomValue(pageStateAtom);
	const syncState = useSyncState();

	const resetRunData = () => {
		setLog(null);
		setPreviewData(null);
		setPreviewDataType(null);
	};

	useEffect(() => {
		if (name && testCode !== null) {
			const fileSpecificKey = `${appName}_${pageName}_${name}`;
			sessionStorage.setItem(fileSpecificKey, testCode);
		}
	}, [testCode, name, appName, pageName]);

	const runHandlers = {
		onSuccess: (response: any) => {
			syncState(response);
			setLog(logBuilder(response));

			setPreviewDataType(response?.type);

			if (panelRef?.current?.getSize() < 20) {
				panelRef?.current?.resize(50);
			}

			if (response?.columns) {
				setPreviewData({
					rows: response?.data || [],
					columns: response?.columns || [],
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
				test: testCode,
				code,
				pageState,
			});
		} else {
			const declarations = findFunctionDeclarations(code);
			const defaultTestCode = declarations.find((d) => d?.name === file?.name)?.call || '';

			setTestCode(defaultTestCode);

			runPythonMutation.mutate({
				testCode: defaultTestCode,
				fileCode: code,
				pageState,
				appName,
				pageName,
			});
		}
	}, [code, file, pageState, runPythonMutation, testCode, appName, pageName]);

	const executeShortcut = useCallback(() => {
		if (file && !runPythonMutation.isLoading && !runSQLQueryMutation.isLoading) {
			setPreviewCode((old: any) => ({ ...old, execute: false }));
			handleRunPythonFunction();
		}
	}, [file, setPreviewCode, runPythonMutation, runSQLQueryMutation, handleRunPythonFunction]);

	useEffect(() => {
		if (execute) {
			executeShortcut();
		}
	}, [execute, executeShortcut]);

	const isLoading = runPythonMutation.isLoading || runSQLQueryMutation.isLoading;

	const handleTestCodeMount = (editor: any) => {
		editor.onDidContentSizeChange((event: any) => {
			const editorHeight = event.contentHeight;
			setTestCodeHeight(editorHeight); // Dynamically adjust height based on content
			editor.layout();
		});
	};

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
				pb="3"
				spacing="0"
				alignItems="start"
				direction="row"
				mb={0}
			>
				<IconButton
					icon={<Play size="12" />}
					mx="1"
					aria-label="Run function"
					size="2xs"
					mt="2"
					flexShrink="0"
					colorScheme="gray"
					variant="outline"
					borderRadius="md"
					isLoading={isLoading}
					onClick={handleRunPythonFunction}
					isDisabled={file?.type !== 'python' || !testCode}
				/>

				{file?.type === 'python' ? (
					<MonacoEditor
						value={testCode}
						onChange={setTestCode}
						language="python"
						path={`${MODEL_SCHEME}:${MODEL_PATH}`}
						onMount={handleTestCodeMount}
						height={testCodeHeight}
					/>
				) : (
					<Text py="1" px="4" color="gray.700" fontSize="sm" mt="2">
						Cannot test this file type
					</Text>
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

				{previewDataType === 'table' && previewData?.columns?.length > 0 ? (
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