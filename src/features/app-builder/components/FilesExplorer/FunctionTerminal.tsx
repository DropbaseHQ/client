import { IconButton, Skeleton, SkeletonCircle, Stack, Text } from '@chakra-ui/react';
import { Play } from 'react-feather';
import * as monacoLib from 'monaco-editor';
import { useAtom, useAtomValue } from 'jotai';

import { useMonaco } from '@monaco-editor/react';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { MonacoEditor } from '@/components/Editor';
import { useRunFunction } from '@/features/app-builder/hooks';
import { pageStateAtom, useSyncState } from '@/features/app-state';
import {
	MODEL_PATH,
	MODEL_SCHEME,
	findFunctionDeclarations,
	generateFunctionCallSuggestions,
} from '@/features/app-builder/utils';
import { useGetPage } from '@/features/page';
import { logsAtom, previewCodeAtom } from '../../atoms';
import { getErrorMessage, getLogInfo } from '@/utils';
import { useToast } from '@/lib/chakra-ui';

export const FunctionTerminal = () => {
	const [{ code, name, execute }, setPreviewCode] = useAtom(previewCodeAtom);

	const [, setLogs] = useAtom(logsAtom);

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
				...getLogInfo({ info: response }),
				meta: {
					type: 'test',
					state: variables?.pageState,
				},
			});
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
		if (file && !runPythonMutation.isLoading) {
			setPreviewCode((old: any) => ({ ...old, execute: false }));
			handleRunPythonFunction();
		}
	}, [file, setPreviewCode, runPythonMutation, handleRunPythonFunction]);

	useEffect(() => {
		if (execute) {
			executeShortcut();
		}
	}, [execute, executeShortcut]);

	const { isLoading } = runPythonMutation;

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
		<Stack w="full" spacing="0">
			{file?.type === 'python' ? (
				<>
					<Stack bg="gray.50" px="2" py="1" borderBottomWidth="1px" borderTopWidth="1px">
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
		</Stack>
	);
};
