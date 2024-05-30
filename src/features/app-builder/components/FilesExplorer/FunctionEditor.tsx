import {
	Box,
	Button,
	Divider,
	IconButton,
	Skeleton,
	SkeletonCircle,
	Stack,
	Text,
} from '@chakra-ui/react';

import { useSetAtom } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Play, RotateCw, Save } from 'react-feather';
import { debounce } from 'lodash';
import { useQueryClient } from 'react-query';
import { useToast } from '@/lib/chakra-ui';

import { usePythonEditor } from '@/components/Editor';
import {
	COLUMN_PROPERTIES_QUERY_KEY,
	useFile,
	usePageFiles,
	useSaveCode,
} from '@/features/app-builder/hooks';
import { PAGE_DATA_QUERY_KEY, useGetPage } from '@/features/page';

import { getErrorMessage } from '@/utils';
import { TABLE_DATA_QUERY_KEY } from '@/features/smart-table/hooks';

import { previewCodeAtom } from '../../atoms';

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
	const { files } = useGetPage({ appName, pageName });

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

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const refetchMethods = useCallback(
		debounce(() => {
			queryClient.invalidateQueries(PAGE_DATA_QUERY_KEY);
		}, 2500),
		[],
	);

	useEffect(() => {
		if (code !== updatedCode) {
			refetchMethods();
		}
	}, [refetchMethods, updatedCode, code]);

	const handleSave = () => {
		savePythonMutation.mutate({
			pageName,
			appName,
			fileName: name,
			code: updatedCode,
			fileType: file?.type,
		});
	};

	useEffect(() => {
		setCode(code);
	}, [name, code]);

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

	return (
		<Stack h="full" bg="white" spacing="0" divider={<Divider />} w="full">
			<Stack p="2" direction="row" alignItems="center" justifyContent="space-between">
				<Text fontSize="md" fontWeight="semibold">
					{/* TODO: AZ style these better */}
					{file.title} ({fileName})
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
						isLoading={savePythonMutation.isLoading}
						colorScheme="gray"
						size="sm"
						isDisabled={code === updatedCode}
						leftIcon={<Save size="14" />}
					>
						Update
					</Button>
				</Stack>
			</Stack>

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
