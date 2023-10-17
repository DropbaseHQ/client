// import { Code, IconButton, Skeleton, SkeletonCircle, Stack, Text } from '@chakra-ui/react';
// import { Play, Save, X } from 'react-feather';
// import * as monacoLib from 'monaco-editor';
// import { useAtomValue } from 'jotai';
// import { useParams } from 'react-router-dom';

// import { useMonaco } from '@monaco-editor/react';
// import { useEffect, useMemo, useState } from 'react';

// import { MonacoEditor } from '@/components/Editor';
// import {
// 	usePageFunction,
// 	useRunFunction,
// 	useUpdateFunction,
// } from '@/features/new-app-builder/hooks';
// import { newPageStateAtom, useSyncState } from '@/features/new-app-state';
// import {
// 	MODEL_PATH,
// 	MODEL_SCHEME,
// 	findFunctionDeclarations,
// 	generateFunctionCallSuggestions,
// 	logBuilder,
// } from '@/features/new-app-builder/utils';
// import { DeleteFunction } from '@/features/new-app-builder/components/PropertiesEditor/DeleteFunction';

// export const FunctionEditor = ({ id }: any) => {
// 	const { pageId } = useParams();
// 	const {
// 		isLoading,
// 		code: defaultCode,
// 		name,
// 		refetch,
// 		test_code: defaultTestCode,
// 	} = usePageFunction(id || '');

// 	const monaco = useMonaco();

// 	const [testCode, setTestCode] = useState('');
// 	const [log, setLog] = useState<any>(null);

// 	const pageState = useAtomValue(newPageStateAtom);

// 	const syncState = useSyncState();

// 	const updateMutation = useUpdateFunction({
// 		onSuccess: () => {
// 			refetch();
// 		},
// 	});

// 	const runMutation = useRunFunction({
// 		onSuccess: (data: any) => {
// 			syncState(data);

// 			setLog(logBuilder(data));
// 		},
// 		onMutate: () => {
// 			setLog(null);
// 		},
// 	});

// 	const [code, setCode] = useState('');

// 	useEffect(() => {
// 		setCode(defaultCode);
// 	}, [defaultCode]);

// 	useEffect(() => {
// 		setTestCode(defaultTestCode);
// 	}, [defaultTestCode]);

// 	const functionDeclarations = useMemo(() => {
// 		return findFunctionDeclarations(code || '');
// 	}, [code]);

// 	useEffect(() => {
// 		if (!monaco) {
// 			return () => {};
// 		}

// 		const { dispose } = (monaco as any).languages.registerCompletionItemProvider('python', {
// 			triggerCharacters: ['.', '"'],
// 			provideCompletionItems: (
// 				model: monacoLib.editor.ITextModel,
// 				position: monacoLib.Position,
// 			) => {
// 				return generateFunctionCallSuggestions(model, position, functionDeclarations);
// 			},
// 		});

// 		return dispose;
// 	}, [monaco, code, functionDeclarations]);

// 	const handleSave = () => {
// 		updateMutation.mutate({
// 			functionId: id,
// 			code,
// 			name,
// 		});
// 	};

// 	const handleRun = () => {
// 		runMutation.mutate({ pageId, functionId: id, pageState, testCode, code });
// 	};

// 	if (isLoading) {
// 		return (
// 			<Stack p="3" spacing="2">
// 				<Skeleton startColor="gray.200" endColor="gray.300" h="32" />
// 				<Stack direction="row">
// 					<SkeletonCircle h="10" w="10" />
// 					<Skeleton startColor="gray.200" w="full" endColor="gray.300" h="10" />
// 				</Stack>
// 			</Stack>
// 		);
// 	}

// 	return (
// 		<Stack p="3" spacing="1">
// 			<MonacoEditor language="python" value={code} onChange={setCode} />

// 			<Stack bg="white" p="1" spacing="0" alignItems="center" direction="row">
// 				<IconButton
// 					icon={<Play size="14" />}
// 					variant="outline"
// 					size="xs"
// 					colorScheme="gray"
// 					aria-label="Run code"
// 					borderRadius="full"
// 					isLoading={runMutation.isLoading}
// 					onClick={handleRun}
// 					isDisabled={!testCode}
// 					flexShrink="0"
// 				/>

// 				<MonacoEditor
// 					value={testCode}
// 					onChange={setTestCode}
// 					language="python"
// 					path={`${MODEL_SCHEME}:${MODEL_PATH}`}
// 				/>

// 				<IconButton
// 					icon={<Save size="14" />}
// 					variant="ghost"
// 					size="xs"
// 					colorScheme="blue"
// 					isDisabled={defaultCode === code}
// 					onClick={handleSave}
// 					isLoading={updateMutation.isLoading}
// 					aria-label="Save code"
// 					flexShrink="0"
// 				/>
// 			</Stack>

// 			{log ? (
// 				<Stack bg="white" p="2" h="full" borderRadius="sm">
// 					<Stack direction="row" alignItems="start">
// 						<IconButton
// 							aria-label="Close output"
// 							size="xs"
// 							colorScheme="gray"
// 							variant="outline"
// 							borderRadius="full"
// 							icon={<X size={14} />}
// 							onClick={() => setLog(null)}
// 						/>

// 						<Stack>
// 							<Text fontSize="sm" letterSpacing="wide" fontWeight="medium">
// 								Output
// 							</Text>
// 							<Code
// 								w="full"
// 								color="gray.500"
// 								backgroundColor="inherit"
// 								overflow="auto"
// 								height={`${(log?.split('\n').length || 1) * 24}px`}
// 							>
// 								<pre>{log}</pre>
// 							</Code>
// 						</Stack>
// 					</Stack>
// 				</Stack>
// 			) : null}

// 			<DeleteFunction
// 				w="fit-content"
// 				mt="4"
// 				variant="outline"
// 				functionId={id}
// 				functionName={name}
// 			/>
// 		</Stack>
// 	);
// };

import { Box } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { usePythonEditor } from '@/components/Editor';

const fetchPageFunction = async () => {
	const response = await axios.get<any>(
		`${import.meta.env.VITE_WORKER_API_ENDPOINT}/workspace/app/page1/scripts/function1.py`,
	);

	return response.data;
};

export const FunctionEditor = () => {
	const [code, setCode] = useState('testt');

	const { data: response, isLoading } = useQuery('code', () => fetchPageFunction());

	const editorRef = usePythonEditor({
		filepath: '/Users/ayazhan/dropbase/worker/workspace/app/page1/scripts/function1.py',
		code,
		onChange: (newValue) => {
			setCode(newValue);
		},
	});

	useEffect(() => {
		setCode(response);
	}, [setCode, response]);

	if (isLoading) {
		return null;
	}

	return <Box ref={editorRef} as="div" w="full" h="sm" />;
};
