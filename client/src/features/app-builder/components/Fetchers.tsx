import { Box, Button, Code, IconButton, Stack, Text } from '@chakra-ui/react';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { Play, X } from 'react-feather';
import { useParams } from 'react-router-dom';

import { fetchersAtom, selectedRowAtom, userInputAtom } from '../atoms/tableContextAtoms';

import { usePythonEditor } from '@/components/Editor';
import { useRunFunction } from '@/features/app-builder/hooks/useRunFunction';
import { useGetApp } from '@/features/app/hooks';
import { useToast } from '@/lib/chakra-ui';
import { BG_BUTTON, BG_FOCUSED, BG_UNFOCUSED } from '@/utils/constants';

export const FetchEditor = ({ id, code, setCode }: { id: string; code: string; setCode: any }) => {
	const { appId } = useParams();
	const toast = useToast();

	const [log, setLog] = useState<any>(null);

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
		<Stack spacing="0" borderRadius="sm" borderWidth="1px" bg={BG_FOCUSED}>
			<Box flex="1" ref={editorRef} as="div" w="full" borderBottomWidth="1px" h="full" />
			<Stack direction="row" alignItems="center" p="2" pl="1rem">
				<IconButton
					borderRadius="full"
					size="xs"
					color="black"
					backgroundColor={BG_BUTTON}
					isLoading={runFunctionMutation.isLoading}
					icon={<Play size="14" fill="true" />}
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
				{!runDisabledError ? (
					<Code color="gray.500" backgroundColor="inherit" paddingLeft="1rem">
						{functionCall}
					</Code>
				) : (
					<Text
						px="2"
						fontSize="xs"
						letterSpacing="wide"
						color="muted"
						fontWeight="medium"
						paddingLeft="1rem"
					>
						{runDisabledError}
					</Text>
				)}
			</Stack>
			{log?.result ? (
				<Stack pt="2" h="full" borderTopWidth="1px" px="2" pl="1rem">
					<Stack direction="row" alignItems="center">
						<IconButton
							aria-label="Close output"
							isRound={true}
							size="xs"
							color="black"
							backgroundColor={BG_BUTTON}
							icon={<X size={14} />}
							onClick={() => setLog(null)}
						/>

						<Text px="2" fontSize="xs" letterSpacing="wide" fontWeight="bold">
							Output
						</Text>
					</Stack>

					<Code
						color="gray.500"
						backgroundColor="inherit"
						paddingLeft="3rem"
						overflowY="scroll"
						overflowX="hidden"
						height={`${(outputPreview?.split('\n').length || 1) * 20}px`}
					>
						<pre>{outputPreview}</pre>
					</Code>
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
		<Stack position="relative" h="full" bg={BG_UNFOCUSED} minH="full" spacing="4">
			<Stack overflowY="auto" flex="1" px="2" pt="2" pb="10" spacing="4" h="full">
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
