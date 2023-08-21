import { useEffect, useState } from 'react';
import { Box, Button, IconButton, Stack, Text } from '@chakra-ui/react';
import { Play } from 'react-feather';
import MonacoEditor, { useMonaco } from '@monaco-editor/react';
import { useParams } from 'react-router-dom';
import { useAtom, useAtomValue } from 'jotai';

import { fetchersAtom, selectedRowAtom, userInputAtom } from '../atoms/tableContextAtoms';

import { usePythonEditor } from '@/components/Editor';
import { useGetApp } from '@/features/app/hooks';
import { useMonacoTheme } from '@/components/Editor/hooks/useMonacoTheme';
import { useRunFunction } from '@/features/app-builder/hooks/useRunFunction';
import { useToast } from '@/lib/chakra-ui';

export const FetchEditor = ({ id, code, setCode }: { id: string; code: string; setCode: any }) => {
	const { appId } = useParams();
	const toast = useToast();

	const [log, setLog] = useState<any>(null);

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

	const functionRegex = /^def\s+(?<call>(?<name>\w*)\s*\((?<params>[\S\s]*?)\)(?:\s*->\s*[\S\s]+?|\s*)):/gm;
	const matches = code.matchAll(functionRegex);
	const firstMatch = matches.next();
	const { name, params } = firstMatch?.value?.groups || { name: null, params: null };

	if (!matches.next().done) {
		// more than one function was matched
		// MAYBE TODO: warn user
	}

	const argumentsName = (params || '')
		?.split(',')
		.map((s: any) => s.trim().split(':')?.[0])
		?.filter(Boolean);

	const functionCall = name ? `${name}(${argumentsName?.join(', ')})` : null;

	return (
		<Stack minH="2xs" spacing="0" borderTopWidth="1px" borderBottomWidth="1px">
			<Box flex="1" ref={editorRef} as="div" w="full" borderBottomWidth="1px" h="full" />
			<Stack direction="row" alignItems="center" p="2">
				<IconButton
					borderRadius="full"
					size="xs"
					isLoading={runFunctionMutation.isLoading}
					icon={<Play size="14" />}
					aria-label="Run code"
					isDisabled={!functionCall}
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
				{functionCall ?
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
					: <Text
						px="2"
						fontSize="xs"
						letterSpacing="wide"
						color="muted"
						fontWeight="semibold"
					>
						No function detected.
					</Text>
				}
			</Stack>
			{log?.message ? (
				<Stack pt="2" borderTopWidth="1px">
					<Text
						px="2"
						fontSize="xs"
						letterSpacing="wide"
						color="muted"
						fontWeight="semibold"
					>
						Output
					</Text>
					<MonacoEditor
						language="shell"
						height={`${(log?.data?.split('\n').length || 1) * 20}px`}
						options={{
							readOnly: true,
							minimap: { enabled: false },
							glyphMargin: false,
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
						value={log?.data}
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

	useEffect(() => {
		if (savedFetchers && savedFetchers.length > 0) {
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

	return (
		<Stack h="full" bg="gray.50" minH="full" overflowY="auto" spacing="4">
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
					/>
				);
			})}

			<Stack
				mt="auto"
				position="sticky"
				bottom="0"
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
				<Button
					size="sm"
					onClick={() => {
						console.log('Fetchers', fetchers);
					}}
				>
					Test console
				</Button>
			</Stack>
		</Stack>
	);
};
