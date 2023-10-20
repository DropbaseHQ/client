import { Code, IconButton, Stack, Text } from '@chakra-ui/react';
import { Play, X } from 'react-feather';
import * as monacoLib from 'monaco-editor';
import { useAtomValue } from 'jotai';

import { useMonaco } from '@monaco-editor/react';
import { useEffect, useState } from 'react';

import { MonacoEditor } from '@/components/Editor';
import { useAllPageFunctionNames, useRunFunction } from '@/features/new-app-builder/hooks';
import { newPageStateAtom, useSyncState } from '@/features/new-app-state';
import {
	MODEL_PATH,
	MODEL_SCHEME,
	generateFunctionCallSuggestions,
	logBuilder,
} from '@/features/new-app-builder/utils';
import { pageAtom } from '@/features/new-page';
import { ChakraTable } from '@/components/Table';

export const FunctionTerminal = () => {
	const { appName, pageName } = useAtomValue(pageAtom);

	const monaco = useMonaco();

	const [testCode, setTestCode] = useState('');
	const [log, setLog] = useState<any>(null);
	const [previewData, setPreviewData] = useState<any>(null);

	const { functions } = useAllPageFunctionNames({ appName, pageName });

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
				return generateFunctionCallSuggestions(model, position, functions);
			},
		});

		return dispose;
	}, [monaco, functions]);

	const handleRun = () => {
		runMutation.mutate({
			pageName,
			appName,
			pageState,
			code: testCode,
		});
	};

	return (
		<Stack spacing="1">
			<Stack bg="white" p="1" spacing="0" alignItems="center" direction="row">
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
				<Stack bg="white" p="2" h="full" borderRadius="sm">
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
				<ChakraTable {...previewData} maxH="sm" borderRadius="sm" />
			) : null}
		</Stack>
	);
};
