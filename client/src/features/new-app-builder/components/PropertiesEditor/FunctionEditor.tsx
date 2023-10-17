import { Box, Code, IconButton, Skeleton, SkeletonCircle, Stack, Text } from '@chakra-ui/react';
import { Play, X } from 'react-feather';
import * as monacoLib from 'monaco-editor';
import { useAtomValue } from 'jotai';
import { useParams } from 'react-router-dom';

import { useMonaco } from '@monaco-editor/react';
import { useEffect, useMemo, useState } from 'react';

import { MonacoEditor, usePythonEditor } from '@/components/Editor';
import { usePageFunction, useRunFunction } from '@/features/new-app-builder/hooks';
import { newPageStateAtom, useSyncState } from '@/features/new-app-state';
import {
	MODEL_PATH,
	MODEL_SCHEME,
	findFunctionDeclarations,
	generateFunctionCallSuggestions,
	logBuilder,
} from '@/features/new-app-builder/utils';
import { DeleteFunction } from '@/features/new-app-builder/components/PropertiesEditor/DeleteFunction';

const PythonEditorLSP = ({ code: defaultCode, id }: any) => {
	const [code, setCode] = useState(defaultCode);

	const editorRef = usePythonEditor({
		filepath: id,
		code,
		onChange: (newValue) => {
			setCode(newValue);
		},
	});

	return <Box ref={editorRef} as="div" w="full" />;
};

export const FunctionEditor = ({ id }: any) => {
	const functionName = id.split('/').pop();
	const { pageId } = useParams();

	const { isLoading, code } = usePageFunction({
		appName: 'app',
		pageName: 'page1',
		functionName,
	});

	const monaco = useMonaco();

	const [testCode, setTestCode] = useState('');
	const [log, setLog] = useState<any>(null);

	const pageState = useAtomValue(newPageStateAtom);

	const syncState = useSyncState();

	const runMutation = useRunFunction({
		onSuccess: (data: any) => {
			syncState(data);

			setLog(logBuilder(data));
		},
		onMutate: () => {
			setLog(null);
		},
	});

	// useEffect(() => {
	// 	setTestCode(defaultTestCode);
	// }, [defaultTestCode]);

	const functionDeclarations = useMemo(() => {
		return findFunctionDeclarations(code || '');
	}, [code]);

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
				return generateFunctionCallSuggestions(model, position, functionDeclarations);
			},
		});

		return dispose;
	}, [monaco, code, functionDeclarations]);

	const handleRun = () => {
		runMutation.mutate({ pageId, functionId: id, pageState, testCode, code });
	};

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
		<Stack p="3" spacing="1">
			<PythonEditorLSP code={code} id={id} key={id} />

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

			<DeleteFunction
				w="fit-content"
				mt="4"
				variant="outline"
				functionId={id}
				functionName={functionName}
			/>
		</Stack>
	);
};
