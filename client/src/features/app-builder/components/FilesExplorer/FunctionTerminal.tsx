import { Box, IconButton, Stack, Text } from '@chakra-ui/react';
import { Play, X } from 'react-feather';
import * as monacoLib from 'monaco-editor';
import { useAtomValue } from 'jotai';

import { useMonaco } from '@monaco-editor/react';
import { useEffect, useState } from 'react';

import { MonacoEditor } from '@/components/Editor';
import { useRunFunction } from '@/features/app-builder/hooks';
import { newPageStateAtom, useSyncState } from '@/features/app-state';
import {
	MODEL_PATH,
	MODEL_SCHEME,
	findFunctionDeclarations,
	generateFunctionCallSuggestions,
	logBuilder,
} from '@/features/app-builder/utils';
import { pageAtom } from '@/features/page';
import { ChakraTable } from '@/components/Table';

export const FunctionTerminal = ({ code, file }: any) => {
	const { appName, pageName } = useAtomValue(pageAtom);

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

	const runMutation = useRunFunction({
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
			resetRunData();
		},
	});

	useEffect(() => {
		if (!monaco) {
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

		return dispose;
	}, [monaco, code]);

	const handleRun = () => {
		runMutation.mutate({
			pageName,
			appName,
			pageState,
			code: testCode,
			file,
		});
	};

	return (
		<Stack w="full" spacing="1">
			<Stack
				borderBottomWidth="1px"
				bg="white"
				p="2"
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
					isDisabled={!testCode}
					flexShrink="0"
				/>

				<MonacoEditor
					value={testCode}
					onChange={setTestCode}
					language="python"
					path={`${MODEL_SCHEME}:${MODEL_PATH}`}
				/>
			</Stack>

			{log ? (
				<Stack borderBottomWidth="1px" bg="white" p="2" w="full" h="full" borderRadius="sm">
					<Stack direction="row" alignItems="start">
						<IconButton
							aria-label="Close output"
							size="xs"
							colorScheme="gray"
							variant="outline"
							borderRadius="full"
							icon={<X size={14} />}
							onClick={() => setLog(null)}
						/>

						<Stack w="full" overflow="auto">
							<Text fontSize="sm" letterSpacing="wide" fontWeight="medium">
								Output
							</Text>
							<Box borderWidth="1px" borderColor="blackAlpha.100" borderRadius="sm">
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
				<Stack maxW="container.lg" overflowX="auto" borderRightWidth="1px">
					<ChakraTable {...previewData} maxH="sm" borderRadius="sm" />
				</Stack>
			) : null}
		</Stack>
	);
};
