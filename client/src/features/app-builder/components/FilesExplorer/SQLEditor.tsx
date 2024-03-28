import {
	Box,
	Button,
	FormControl,
	FormLabel,
	IconButton,
	Skeleton,
	SkeletonCircle,
	Stack,
	Text,
	Tooltip,
} from '@chakra-ui/react';
import { Play, Save, Info, RotateCw } from 'react-feather';
import { useSetAtom, useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { MonacoEditor } from '@/components/Editor';
import { useFile, useSaveCode, useSources } from '@/features/app-builder/hooks';
import { useGetPage } from '@/features/page';
import { InputRenderer } from '@/components/FormInput';
import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';
import { previewCodeAtom } from '../../atoms';

import { useSQLCompletion } from '@/components/Editor/hooks/useSQLCompletion';
import { pageStateContextAtom } from '@/features/app-state';

import { databaseSchema } from '@/components/Editor/utils/constants';
import { useGetCurrentUser } from '@/features/authorization/hooks/useGetUser';

export const SQLEditor = ({ name }: any) => {
	const toast = useToast();
	const { appName, pageName } = useParams();
	const { files, tables } = useGetPage({ appName, pageName });
	const { user } = useGetCurrentUser();

	const file = files.find((f: any) => f.name === name);
	const sqlName = file?.name;

	const [selectedSource, setSource] = useState();

	const fullFileName = file ? `${sqlName}.${file?.type}` : null;
	const {
		isLoading,
		code: defaultCode,
		refetch,
		isRefetching,
	} = useFile({
		pageName,
		appName,
		fileName: fullFileName,
	});

	const setPreviewFile = useSetAtom(previewCodeAtom);

	const [code, setCode] = useState('');

	const { sources, isLoading: isLoadingSources } = useSources();

	// Small hack to prevent test users on try.dropbase.io to see all sources
	// This was easier to do than refactoring the backend to deal with it
	const getFilteredSources = () => {
		if (
			window.location.pathname.includes('try.dropbase.io') &&
			user.email.includes('@try.dropbase.io')
		) {
			return sources.filter((s) => s === 'try_dropbase');
		}
		return sources;
	};

	useEffect(() => {
		setSource(file?.source);
	}, [setSource, file]);

	useEffect(() => {
		setCode(defaultCode);
	}, [defaultCode, name]);

	useEffect(() => {
		setPreviewFile({
			name,
			code,
			source: selectedSource,
			execute: false,
		});

		return () => {
			setPreviewFile({
				name: null,
				code: null,
				source: null,
				execute: false,
			});
		};
	}, [name, code, selectedSource, setPreviewFile]);

	const executeRunCommand = () => {
		setPreviewFile({
			name,
			code,
			source: selectedSource,
			execute: true,
		});
	};

	const saveSQLMutation = useSaveCode({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'Updated SQL',
			});
			refetch();
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to update SQL',
				description: getErrorMessage(error),
			});
		},
	});

	const handleSave = () => {
		saveSQLMutation.mutate({
			pageName,
			appName,
			fileName: sqlName,
			code,
			source: selectedSource,
			fileType: file?.type,
		});
	};

	const newPageStateContext = useAtomValue(pageStateContextAtom);

	useSQLCompletion(databaseSchema, newPageStateContext);

	if (isLoading || isLoadingSources) {
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
		<Stack bg="white" h="full" overflowY="auto" overflowX="hidden" spacing="0">
			<Stack spacing="3">
				<Stack
					p="2"
					borderBottomWidth="1px"
					direction="row"
					alignItems="center"
					justifyContent="space-between"
				>
					<Text fontSize="md" fontWeight="semibold">
						{fullFileName}
					</Text>
					<Stack alignItems="center" direction="row">
						<IconButton
							aria-label="Reload file"
							flexShrink="0"
							colorScheme="gray"
							size="sm"
							variant="outline"
							icon={<RotateCw size={12} />}
							onClick={() => {
								refetch();
							}}
							isLoading={isRefetching}
						/>
						<Button
							w="fit-content"
							isLoading={saveSQLMutation.isLoading}
							onClick={handleSave}
							variant="outline"
							colorScheme="gray"
							size="sm"
							isDisabled={
								!selectedSource ||
								!code ||
								(code === defaultCode && file?.source === selectedSource)
							}
							leftIcon={<Save size="14" />}
						>
							Update
						</Button>
					</Stack>
				</Stack>
				<Stack direction="row" px="3" pb="3" borderBottomWidth="1px" alignItems="start">
					<FormControl>
						<FormLabel>
							<Stack direction="row" alignItems="center">
								<Text>Source</Text>

								<Box as="span" color="red.500">
									*
								</Box>
							</Stack>
						</FormLabel>
						<InputRenderer
							size="sm"
							maxW="lg"
							type="select"
							placeholder="Sources"
							value={selectedSource}
							options={getFilteredSources()?.map((s) => ({ name: s, value: s }))}
							onChange={(newSelectedSource: any) => {
								setSource(newSelectedSource);
							}}
						/>
					</FormControl>

					<FormControl>
						<FormLabel>
							<Stack direction="row" alignItems="center">
								<Text>Refetch on row change in table…</Text>
								<Tooltip
									label="Select table for which a row change triggers this function to refetch"
									fontSize="sm"
								>
									<Info size="10" />
								</Tooltip>
							</Stack>
						</FormLabel>
						<InputRenderer
							type="multiselect"
							id="depends"
							maxW="lg"
							name="Depends on"
							placeholder="Select table(s)"
							options={tables.map((t: any) => ({
								name: t.name,
								value: t.name,
							}))}
							value={file?.depends_on || []}
						/>
					</FormControl>
				</Stack>
			</Stack>
			<Stack h="full" spacing="0" direction="row">
				<IconButton
					mx="1"
					aria-label="Run function"
					size="2xs"
					mt="2"
					flexShrink="0"
					colorScheme="gray"
					variant="outline"
					borderRadius="md"
					icon={<Play size={12} />}
					onClick={executeRunCommand}
				/>
				<Box h="full" pt="2" w="full" borderLeftWidth="1px">
					<MonacoEditor value={code} onChange={setCode} language="sql" />
				</Box>
			</Stack>
		</Stack>
	);
};
