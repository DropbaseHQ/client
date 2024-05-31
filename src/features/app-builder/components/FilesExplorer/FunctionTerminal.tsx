import {
	Box,
	Code,
	Divider,
	IconButton,
	Skeleton,
	SkeletonCircle,
	Stack,
	Text,
} from '@chakra-ui/react';
import { Play, FileText } from 'react-feather';
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
import { logsAtom, previewCodeAtom } from '../../atoms';
import { getErrorMessage } from '@/utils';
import { useToast } from '@/lib/chakra-ui';

export const FunctionTerminal = ({ panelRef }: any) => {
	const [{ code, name, execute }, setPreviewCode] = useAtom(previewCodeAtom);

	const [{ logs }, setLogs] = useAtom(logsAtom);

	const toast = useToast();

	const { appName, pageName } = useParams();

	const { files, isLoading: isLoadingFiles } = useGetPage({ appName, pageName });
	const file = files.find((f: any) => f.name === name);

	const monaco = useMonaco();

	const [testCode, setTestCode] = useState('');

	const [testCodeHeight, setTestCodeHeight] = useState(16);

	const pageState = useAtomValue(pageStateAtom);
	const syncState = useSyncState();

	const resetRunData = () => {
		//
	};

	useEffect(() => {
		if (name && testCode !== null) {
			const fileSpecificKey = `${appName}_${pageName}_${name}`;
			sessionStorage.setItem(fileSpecificKey, testCode);
		}
	}, [testCode, name, appName, pageName]);

	const runHandlers = {
		onSuccess: (response: any, variables: any) => {
			syncState(response);

			setLogs({
				log: logBuilder(response),
				preview: {
					rows: response?.data || [],
					columns: response?.columns || [],
					type: response?.type,
				},
				meta: {
					type: 'test',
					...variables,
				},
			});

			if (panelRef?.current?.getSize() < 20) {
				panelRef?.current?.resize(50);
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
		<Stack w="full" h="full" spacing="0">
			{file?.type === 'python' ? (
				<>
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
							isDisabled={!testCode}
						/>

						<MonacoEditor
							value={testCode}
							onChange={setTestCode}
							language="python"
							path={`${MODEL_SCHEME}:${MODEL_PATH}`}
							onMount={handleTestCodeMount}
							height={testCodeHeight}
						/>
					</Stack>
				</>
			) : null}

			<Stack bg="white" spacing="0" h="full">
				<Stack
					bg="gray.50"
					px="2"
					py="1"
					borderBottomWidth="1px"
					direction="row"
					alignItems="center"
				>
					<FileText size="12" />
					<Text fontWeight="medium" fontSize="sm">
						Logs & Traceback
					</Text>
				</Stack>

				<Stack h="full" overflowY="auto" spacing="0">
					{logs.map((log) => {
						return (
							<Stack
								flexGrow="0"
								spacing="0"
								divider={<Divider orientation="vertical" />}
								direction="row"
								key={log?.time}
								borderBottomWidth="1px"
							>
								<Stack p="2" flex="1">
									<Code bg="transparent">{new Date(log.time).toString()}</Code>
								</Stack>
								<Stack flex="3" w="full">
									<Box
										minH="40px"
										h={`${Math.min(log.log.split('\n').length, 15) * 12}px`}
									>
										<MonacoEditor
											value={log.log}
											language="shell"
											options={{
												lineNumbers: 'off',
												readOnly: true,
												renderLineHighlight: 'none',
												scrollbar: {
													verticalHasArrows: false,
													alwaysConsumeMouseWheel: false,
													vertical: 'auto',
													horizontal: 'auto',
												},
											}}
										/>
									</Box>

									{log?.preview?.type === 'table' &&
									log?.preview?.columns?.length > 0 ? (
										<Box px="3" w="full" mt="3" pb="3" borderBottomWidth="1px">
											<ChakraTable
												{...log?.preview}
												columns={log?.preview?.columns?.map(
													(c: any) => c.name,
												)}
												maxH="md"
												borderRadius="sm"
											/>
										</Box>
									) : null}
								</Stack>
							</Stack>
						);
					})}
				</Stack>
			</Stack>
		</Stack>
	);
};
