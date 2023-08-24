import { Box, Button, IconButton, Stack, Text } from '@chakra-ui/react';
import MonacoEditor, { useMonaco } from '@monaco-editor/react';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { Play, Trash } from 'react-feather';
import { useParams } from 'react-router-dom';

import { fetchersAtom, selectedRowAtom, userInputAtom } from '../atoms/tableContextAtoms';

import { usePythonEditor } from '@/components/Editor';
import { useMonacoTheme } from '@/components/Editor/hooks/useMonacoTheme';
import { useRunFunction } from '@/features/app-builder/hooks/useRunFunction';
import { useGetApp } from '@/features/app/hooks';
import { useToast } from '@/lib/chakra-ui';
import { useDeleteFunction } from '../hooks/useDeleteFunction';

export const FetchEditor = ({
	id,
	code,
	setCode,
	onDelete,
}: {
	id: string;
	code: string;
	setCode: any;
	onDelete: () => void;
}) => {
	const { appId } = useParams();
	const toast = useToast();

	const [log, setLog] = useState<any>(null);
	const [confirmDelete, setConfirmDelete] = useState(false);

	const monaco = useMonaco();
	useMonacoTheme(monaco);

	const editorRef = usePythonEditor({
		filepath: `fetchers/${id}.py`,
		code,
		onChange: setCode,
	});

	const selectedRow = useAtomValue(selectedRowAtom);
	const userInput = useAtomValue(userInputAtom);

	const runFunctionMutation = useRunFunction({
		onMutate: () => {
			setLog(null);
		},
		onSuccess: (response: any) => {
			setLog(response);
		},
	});

	// If a truthy value is set, the "run block" button is disabled and this error is displayed.
	let runDisabledError = '';

	const functionRegex =
		/^def\s+(?<call>(?<name>\w*)\s*\((?<params>[\S\s]*?)\)(?:\s*->\s*[\S\s]+?|\s*)):/gm;
	const matches = code.matchAll(functionRegex);
	const firstMatch = matches.next();

	const { name, params } = firstMatch?.value?.groups || { name: null, params: null };
	if (!name) {
		runDisabledError = 'No function detected. Fetchers must define one function.';
	} else if (!matches.next().done) {
		runDisabledError =
			'More than one function was detected. Fetchers can only define one function.';
	}

	const argumentsName = (params || '')
		?.split(',')
		.map((s: any) => s.trim().split(':')?.[0])
		?.filter(Boolean);

	const functionCall = name ? `${name}(${argumentsName?.join(', ')})` : '';

	let outputPreview = '';

	if (log?.stdout && log.stdout !== '\n') {
		outputPreview = log.stdout;
	}

	if (log?.traceback) {
		if (outputPreview) {
			outputPreview += '\n';
		}
		outputPreview += `---------------------------------------------------------------------------------\n`;

		outputPreview += log.traceback;
	}

	if (log?.result) {
		if (outputPreview) {
			outputPreview += '\n';
		}
		outputPreview += log.result;
	}

	return (
		<Stack bg="white" spacing="0" borderRadius="sm" borderWidth="1px">
			<Box flex="1" ref={editorRef} as="div" w="full" borderBottomWidth="1px" h="full" />
			<Stack direction="row" alignItems="center" p="2">
				<IconButton
					borderRadius="full"
					size="xs"
					isLoading={runFunctionMutation.isLoading}
					icon={<Play size="14" />}
					aria-label="Run code"
					isDisabled={!!runDisabledError}
					onClick={() => {
						if (appId) {
							if (Object.keys(selectedRow).length > 0) {
								runFunctionMutation.mutate({
									appId,
									functionCall,
									row: selectedRow,
									userInput,
								});
							} else {
								toast({
									status: 'error',
									title: 'Select a row',
								});
							}
						}
					}}
				/>
				{!confirmDelete ? (
					<IconButton
						borderRadius="full"
						size="xs"
						colorScheme="red"
						icon={<Trash size="14" />}
						aria-label="Delete function"
						onClick={() => setConfirmDelete(true)}
					/>
				) : (
					<>
						<Button size="xs" onClick={() => setConfirmDelete(false)}>
							Cancel
						</Button>
						<Button size="xs" colorScheme="red" onClick={onDelete}>
							Confirm delete
						</Button>
					</>
				)}

				{!runDisabledError ? (
					<MonacoEditor
						language="python"
						height="20px"
						options={{
							readOnly: true,
							minimap: { enabled: false },
							lineNumbers: 'off',
							folding: false,
							glyphMargin: false,
							lineDecorationsWidth: 0,
							lineNumbersMinChars: 0,
							scrollbar: {
								vertical: 'hidden',
								horizontal: 'hidden',
								handleMouseWheel: false,
								verticalScrollbarSize: 0,
								verticalHasArrows: false,
							},
							overviewRulerLanes: 0,
							scrollBeyondLastLine: false,
							wordWrap: 'on',
							wrappingStrategy: 'advanced',
						}}
						value={functionCall}
					/>
				) : (
					<Text
						px="2"
						fontSize="xs"
						letterSpacing="wide"
						color="muted"
						fontWeight="medium"
					>
						{runDisabledError}
					</Text>
				)}
			</Stack>
			{log?.result ? (
				<Stack pt="2" h="full" borderTopWidth="1px">
					<Stack direction="row" px="2" justifyContent="space-between">
						<Text
							fontSize="xs"
							letterSpacing="wide"
							color="muted"
							fontWeight="semibold"
						>
							Output
						</Text>
						<Button
							size="xs"
							variant="link"
							onClick={() => {
								setLog(null);
							}}
						>
							Clear
						</Button>
					</Stack>
					<MonacoEditor
						language="shell"
						height={`${(outputPreview?.split('\n').length || 1) * 20}px`}
						options={{
							readOnly: true,
							minimap: { enabled: false },
							glyphMargin: false,

							lineNumbers: 'off',
							scrollbar: {
								vertical: 'hidden',
								horizontal: 'hidden',
								handleMouseWheel: false,
								verticalScrollbarSize: 0,
								verticalHasArrows: false,
							},
							overviewRulerLanes: 0,
							scrollBeyondLastLine: false,
							wordWrap: 'on',
							wrappingStrategy: 'advanced',
						}}
						value={outputPreview}
					/>
				</Stack>
			) : null}
		</Stack>
	);
};

export const Fetchers = () => {
	const [fetchers, setFetchers] = useAtom(fetchersAtom);
	const { appId } = useParams();
	const { fetchers: savedFetchers } = useGetApp(appId || '');

	const deleteFunctionMutation = useDeleteFunction();

	useEffect(() => {
		if (savedFetchers?.length > 0) {
			const formattedFetchers = savedFetchers.reduce((acc: any, curr: any) => {
				acc[curr.id] = curr.code;
				return acc;
			}, {});

			setFetchers(formattedFetchers);
		}
	}, [savedFetchers, setFetchers]);

	const createNewFetcher = () => {
		// let rand_str = (Math.random() + 1).toString(36).substring(7);
		const newUUID = crypto.randomUUID();
		setFetchers({
			...fetchers,
			[`${newUUID}`]: `# some comment ${newUUID}`,
		});
	};

	const deleteFetcher = (id: string) => {
		if (savedFetchers) {
			const fetcherToDelete = savedFetchers.find((f: any) => f.id === id);
			if (fetcherToDelete) {
				deleteFunctionMutation.mutate(id);
			}
		}
		const { [id]: _, ...rest } = fetchers;
		setFetchers(rest);
	};

	return (
		<Stack position="relative" h="full" bg="gray.50" minH="full" spacing="4">
			<Stack overflowY="auto" flex="1" px="4" pt="4" pb="10" spacing="4" h="full">
				{Object.keys(fetchers).map((fetchId: any) => {
					return (
						<FetchEditor
							key={fetchId}
							code={fetchers[fetchId]}
							setCode={(n: any) => {
								setFetchers((f: any) => ({
									...f,
									[fetchId]: n,
								}));
							}}
							id={fetchId}
							onDelete={() => deleteFetcher(fetchId)}
						/>
					);
				})}
			</Stack>

			<Stack
				position="absolute"
				bottom="0"
				w="full"
				bg="white"
				direction="row"
				p="2"
				alignItems="center"
				borderTopWidth="0.5px"
				justifyContent="space-between"
			>
				<Button size="sm" onClick={createNewFetcher}>
					Create new fetcher
				</Button>
			</Stack>
		</Stack>
	);
};
