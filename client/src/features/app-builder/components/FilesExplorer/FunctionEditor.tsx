import {
	Alert,
	AlertDescription,
	AlertIcon,
	Box,
	Button,
	Divider,
	FormControl,
	FormLabel,
	IconButton,
	Skeleton,
	SkeletonCircle,
	Stack,
	Text,
	Tooltip,
} from '@chakra-ui/react';

import { useSetAtom } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Info, Play, RotateCw, Save } from 'react-feather';
import { useQueryClient } from 'react-query';
import { useToast } from '@/lib/chakra-ui';

import { usePythonEditor } from '@/components/Editor';
import {
	COLUMN_PROPERTIES_QUERY_KEY,
	useFile,
	usePageFiles,
	useSaveCode,
} from '@/features/app-builder/hooks';
import { useGetPage } from '@/features/page';

import { getErrorMessage } from '@/utils';
import { TABLE_DATA_QUERY_KEY } from '@/features/smart-table/hooks';
import { findFunctionDeclarations } from '../../utils';
import { previewCodeAtom } from '../../atoms';
import { InputRenderer } from '@/components/FormInput';

const PythonEditorLSP = ({ code: defaultCode, filePath, updateCode, name, onSave }: any) => {
	const [code, setCode] = useState(defaultCode);

	const setPreviewFile = useSetAtom(previewCodeAtom);

	const executeRunCommand = useCallback(() => {
		setPreviewFile({
			name,
			code,
			execute: true,
		});
	}, [code, name, setPreviewFile]);

	const editorRef = usePythonEditor({
		filepath: filePath,
		code,
		onChange: (newValue) => {
			setCode(newValue);
			updateCode(newValue);
		},
		onSave,
	});

	return (
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
			<Box
				data-cy={`code-editor-${name}`}
				ref={editorRef}
				pt="2"
				borderLeftWidth="1px"
				flex="1"
				h="full"
				as="div"
				w="full"
			/>
		</Stack>
	);
};

export const FunctionEditor = ({ name }: any) => {
	const queryClient = useQueryClient();
	const toast = useToast();
	const { appName, pageName } = useParams();
	const { files, tables } = useGetPage({ appName, pageName });

	const { files: workerFiles, isLoading: isLoadingWorkerFiles } = usePageFiles({
		pageName: pageName || '',
		appName: appName || '',
	});

	const file = files.find((f: any) => f.name === name);
	const fileName = file ? `${file?.name}${file?.type === 'sql' ? '.sql' : '.py'}` : null;

	const setPreviewFile = useSetAtom(previewCodeAtom);

	// ⚠️ check using / else will take files which ends with the same keywords like activate.py & deactivate.py
	const filePath = workerFiles.find((f: any) => f.endsWith(`/${fileName}`));
	const { isLoading, code, refetch, isRefetching } = useFile({
		pageName,
		appName,
		fileName,
	});

	const [updatedCode, setCode] = useState(code || '');
	const [depends, setDepends] = useState([]);

	const savePythonMutation = useSaveCode({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'Updated code',
			});
			refetch();
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to update code',
				description: getErrorMessage(error),
			});
		},
	});

	const handleSave = () => {
		savePythonMutation.mutate({
			pageName,
			appName,
			fileName: name,
			code: updatedCode,
			fileType: file?.type,
			depends,
		});
	};

	useEffect(() => {
		setCode(code);
	}, [name, code]);

	useEffect(() => {
		setDepends(file?.depends_on);
	}, [file]);

	useEffect(() => {
		setPreviewFile({
			name,
			code: updatedCode,
			execute: false,
		});
	}, [updatedCode, name, setPreviewFile]);

	useEffect(() => {
		return () => {
			setPreviewFile({
				name: null,
				code: null,
				execute: false,
			});
		};
	}, [name, code, setPreviewFile]);

	const refetchColumns = () => {
		handleSave();
		queryClient.invalidateQueries(TABLE_DATA_QUERY_KEY);
		queryClient.invalidateQueries(COLUMN_PROPERTIES_QUERY_KEY);
	};

	if (isLoading || isLoadingWorkerFiles) {
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

	const functionDeclarations = findFunctionDeclarations(updatedCode);

	const isNotSameFunctionName =
		file?.type === 'python' ? !functionDeclarations.find((f) => f.name === file.name) : false;

	return (
		<Stack h="full" bg="white" spacing="0" divider={<Divider />} w="full">
			<Stack p="2" direction="row" alignItems="center" justifyContent="space-between">
				<Text fontSize="md" fontWeight="semibold">
					{fileName}
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
						onClick={refetchColumns}
						variant="outline"
						colorScheme="gray"
						size="sm"
						isDisabled={
							code === updatedCode &&
							JSON.stringify(depends) === JSON.stringify(file?.depends_on)
						}
						leftIcon={<Save size="14" />}
					>
						Update
					</Button>
				</Stack>
			</Stack>

			{!isLoadingWorkerFiles && updatedCode && isNotSameFunctionName ? (
				<Alert flexShrink="0" status="error">
					<AlertIcon />

					<AlertDescription>
						Please make sure function name matches with the file name
					</AlertDescription>
				</Alert>
			) : null}

			{file?.type === 'python' ? (
				<Stack p="3" borderBottomWidth="1px" alignItems="start" direction="row">
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
							value={depends}
							onChange={(newDepends: any) => {
								setDepends(newDepends);
							}}
						/>
					</FormControl>
				</Stack>
			) : null}

			<Box overflowY="auto" h="full">
				{isRefetching ? (
					<Skeleton startColor="gray.100" endColor="gray.400" h="full" />
				) : (
					<PythonEditorLSP
						code={code}
						name={name}
						updateCode={setCode}
						filePath={filePath}
						key={name}
						onSave={handleSave}
					/>
				)}
			</Box>
		</Stack>
	);
};
