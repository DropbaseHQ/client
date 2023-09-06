import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';

import {
	Box,
	Button,
	ButtonGroup,
	Code,
	IconButton,
	Popover,
	PopoverArrow,
	PopoverBody,
	PopoverCloseButton,
	PopoverContent,
	PopoverFooter,
	PopoverHeader,
	PopoverTrigger,
	Stack,
	Text,
} from '@chakra-ui/react';
import { Play, Trash, X } from 'react-feather';
import { useParams } from 'react-router-dom';

import { fetchersAtom, selectedRowAtom, userInputAtom } from '../atoms/tableContextAtoms';

import { usePythonEditor } from '@/components/Editor';
import { useRunFunction } from '@/features/app-builder/hooks/useRunFunction';
import { useGetPage } from '@/features/app/hooks';
import { useToast } from '@/lib/chakra-ui';
import { useDeleteFunction } from '@/features/app-builder/hooks/useDeleteFetchers';
import { useSaveStudio } from '../hooks/useSaveStudio';

export const findFunctionDeclarations = (code: string) => {
	const functionRegex =
		/^def\s+(?<call>(?<name>\w*)\s*\((?<params>[\S\s]*?)\)(?:\s*->\s*[\S\s]+?|\s*)):/gm;
	return code.matchAll(functionRegex);
};

export const FetchEditor = ({ id, code, setCode }: { id: string; code: string; setCode: any }) => {
	const [showActions, setShowActions] = useState(false);

	const { pageId } = useParams();
	const toast = useToast();

	const deleteFunction = useDeleteFunction();
	const { saveFetchers } = useSaveStudio();

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

	const matches = findFunctionDeclarations(code);
	const firstMatch = matches.next();

	const { name, params } = firstMatch?.value?.groups || { name: null, params: null };
	if (!name) {
		runDisabledError = 'No function detected. Fetchers must define one function.';
	} else if (!matches.next().done) {
		runDisabledError =
			'More than one function was detected. Fetchers can only define one function. (Fetchers will not save until this is fixed.)';
	}

	const argumentsName = (params || '')
		?.split(',')
		.map((s: any) => s.trim().split(':')?.[0])
		?.filter(Boolean);

	const functionCall = name ? `${name}(${argumentsName?.join(', ')})` : '';

	const handleRunFunction = async () => {
		if (pageId) {
			if (Object.keys(selectedRow).length > 0) {
				await saveFetchers();
				runFunctionMutation.mutate({
					pageId,
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
	};

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
		<Stack
			onMouseEnter={() => {
				setShowActions(true);
			}}
			onMouseLeave={() => {
				setShowActions(false);
			}}
			pos="relative"
			spacing="0"
			borderRadius="sm"
			borderWidth="1px"
			bg="white"
		>
			<Box flex="1" ref={editorRef} as="div" w="full" borderBottomWidth="1px" h="full" />

			<Box
				display={showActions ? 'inherit' : 'none'}
				borderWidth="1px"
				borderRadius="md"
				boxShadow="xs"
				bg="white"
				pos="absolute"
				top="-15px"
				right="-15px"
			>
				<Popover>
					{({ onClose }) => (
						<>
							<PopoverTrigger>
								<IconButton
									variant="ghost"
									borderRadius="none"
									size="xs"
									colorScheme="red"
									icon={<Trash size="12" />}
									aria-label="Delete function"
								/>
							</PopoverTrigger>
							<PopoverContent>
								<PopoverArrow />
								<PopoverHeader>Confirm Delete Function</PopoverHeader>
								<PopoverCloseButton size="xs" />
								<PopoverBody>Are you sure you want to delete function?</PopoverBody>
								<PopoverFooter>
									<ButtonGroup display="flex" size="sm" justifyContent="flex-end">
										<Button
											variant="outline"
											colorScheme="gray"
											onClick={onClose}
										>
											Cancel
										</Button>
										<Button
											colorScheme="red"
											onClick={() => {
												deleteFunction(id);
											}}
										>
											Delete
										</Button>
									</ButtonGroup>
								</PopoverFooter>
							</PopoverContent>
						</>
					)}
				</Popover>
			</Box>

			<Stack direction="row" alignItems="center" p="2">
				<IconButton
					borderRadius="full"
					size="xs"
					colorScheme="gray"
					isLoading={runFunctionMutation.isLoading}
					icon={<Play size="14" />}
					variant="outline"
					aria-label="Run code"
					isDisabled={!!runDisabledError}
					onClick={() => {
						handleRunFunction();
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
				<Stack p="2" h="full" borderTopWidth="1px">
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
							<Text fontSize="xs" letterSpacing="wide" fontWeight="semibold">
								Output
							</Text>
							<Code
								w="full"
								color="gray.500"
								backgroundColor="inherit"
								overflow="auto"
								height={`${(outputPreview?.split('\n').length || 1) * 24}px`}
							>
								<pre>{outputPreview}</pre>
							</Code>
						</Stack>
					</Stack>
				</Stack>
			) : null}
		</Stack>
	);
};

export const Fetchers = () => {
	const [fetchers, setFetchers] = useAtom(fetchersAtom);
	const { pageId } = useParams();
	const { fetchers: savedFetchers } = useGetPage(pageId || '');

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
		<Stack position="relative" h="full" bg="bg-canvas" minH="full" spacing="4">
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
