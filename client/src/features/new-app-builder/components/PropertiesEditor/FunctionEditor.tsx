import { Code, IconButton, Skeleton, Stack, Text } from '@chakra-ui/react';
import { Play, Save, X } from 'react-feather';
import * as monacoLib from 'monaco-editor';
import { useAtomValue } from 'jotai';
import { useParams } from 'react-router-dom';

import { useMonaco } from '@monaco-editor/react';
import { useEffect, useMemo, useState } from 'react';

import { MonacoEditor } from '@/components/Editor';
import {
	usePageFunction,
	useRunFunction,
	useUpdateFunction,
} from '@/features/new-app-builder/hooks';
import { newPageStateAtom, useSyncState } from '@/features/new-app-state';
import {
	MODEL_PATH,
	MODEL_SCHEME,
	findFunctionDeclarations,
	generateFunctionCallSuggestions,
	logBuilder,
} from '@/features/new-app-builder/utils';

export const FunctionEditor = ({ id }: any) => {
	const { pageId } = useParams();
	const {
		isLoading,
		code: defaultCode,
		name,
		refetch,
		test_code: defaultTestCode,
	} = usePageFunction(id || '');

	const monaco = useMonaco();

	const [testCode, setTestCode] = useState('');
	const [log, setLog] = useState<any>(null);

	const pageState = useAtomValue(newPageStateAtom);

	const syncState = useSyncState();

	const updateMutation = useUpdateFunction({
		onSuccess: () => {
			refetch();
		},
	});

	const runMutation = useRunFunction({
		onSuccess: (data: any) => {
			syncState(data);

			setLog(logBuilder(data));
		},
		onMutate: () => {
			setLog(null);
		},
	});

	const [code, setCode] = useState('');

	useEffect(() => {
		setCode(defaultCode);
	}, [defaultCode]);

	useEffect(() => {
		setTestCode(defaultTestCode);
	}, [defaultTestCode]);

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

	const handleSave = () => {
		updateMutation.mutate({
			functionId: id,
			code,
			name,
		});
	};

	const handleRun = () => {
		runMutation.mutate({ pageId, functionId: id, pageState, testCode, code });
	};

	if (isLoading) {
		return <Skeleton h="xs" />;
	}

	return (
		<Stack p="3" spacing="1">
			<MonacoEditor language="python" value={code} onChange={setCode} />

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

				<IconButton
					icon={<Save size="14" />}
					variant="ghost"
					size="xs"
					colorScheme="blue"
					isDisabled={defaultCode === code}
					onClick={handleSave}
					isLoading={updateMutation.isLoading}
					aria-label="Save code"
					flexShrink="0"
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
		</Stack>
	);
};
