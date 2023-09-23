import { Box, Code, IconButton, Skeleton, Stack, Text } from '@chakra-ui/react';
import { Play, Save, X } from 'react-feather';
import { useAtom, useAtomValue } from 'jotai';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { initializeLanguageServices, usePythonEditor } from '@/components/Editor';
import {
	usePageFunction,
	useRunFunction,
	useUpdateFunction,
} from '@/features/new-app-builder/hooks';
import { newPageStateAtom, useSyncState } from '@/features/new-app-state';
import { languageClientAtom, lspInitializedAtom } from '@/features/new-app-builder/atoms';
import { logBuilder } from '@/features/new-app-builder/utils';

export const FunctionEditor = ({ id }: any) => {
	const { pageId } = useParams();
	const {
		isLoading,
		code: defaultCode,
		name,
		refetch,
		test_code: defaultTestCode,
	} = usePageFunction(id || '');

	const [testCode, setTestCode] = useState('');
	const [log, setLog] = useState<any>(null);

	const pageState = useAtomValue(newPageStateAtom);

	const [lspInitialized, setLspInitialized] = useAtom(lspInitializedAtom);
	const [languageClient, setLanguageClient] = useAtom(languageClientAtom);

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
		setCode(defaultCode || '\n\n\n\n');
	}, [defaultCode]);

	useEffect(() => {
		setTestCode(defaultTestCode);
	}, [defaultTestCode]);

	// Initialize language services once
	if (!lspInitialized) {
		initializeLanguageServices().then(([_, lc]) => {
			setLanguageClient(lc);
			// Send initial state to LSP
			lc.sendNotification('workspace/setState', { state: JSON.stringify(pageState) });
			setLspInitialized(true);
		});
	}

	// Resend state to LSP on change
	useEffect(() => {
		if (!languageClient) return;
		languageClient.sendNotification('workspace/setState', { state: JSON.stringify(pageState) });
	}, [pageState]);

	const editorRef = usePythonEditor({
		filepath: 'functions.py',
		code,
		onChange: (newValue) => {
			setCode(newValue);
		},
	});
	const testEditorRef = usePythonEditor({
		filepath: 'functionsTest.py',
		code: testCode,
		onChange: (newValue) => {
			setTestCode(newValue);
		},
	});

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
			{lspInitialized && (
				<Box overflowY="auto" h="full">
					<Box ref={editorRef} as="div" w="full" h="full" />
				</Box>
			)}

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

				{lspInitialized && (
					<Box overflowY="auto" h="full">
						<Box ref={testEditorRef} as="div" w="600px" h="50px" />
						{/* FIXME: fix width sizing*/}
					</Box>
				)}

				{/* /> */}

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
