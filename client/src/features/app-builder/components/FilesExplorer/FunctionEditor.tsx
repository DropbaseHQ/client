import {
	Alert,
	AlertDescription,
	AlertIcon,
	Box,
	Button,
	Divider,
	Skeleton,
	SkeletonCircle,
	Stack,
} from '@chakra-ui/react';
import * as monaco from 'monaco-editor';

import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Save } from 'react-feather';
import { useQueryClient } from 'react-query';
import { useToast } from '@/lib/chakra-ui';

import { usePythonEditor } from '@/components/Editor';
import {
	COLUMN_PROPERTIES_QUERY_KEY,
	useFile,
	usePageFiles,
	useSaveCode,
} from '@/features/app-builder/hooks';
import { pageAtom, useGetPage } from '@/features/page';

import { getErrorMessage } from '@/utils';
import { TABLE_DATA_QUERY_KEY } from '@/features/smart-table/hooks';
import { findFunctionDeclarations } from '../../utils';
import { previewCodeAtom } from '../../atoms';

const PythonEditorLSP = ({ code: defaultCode, filePath, updateCode, id }: any) => {
	const [code, setCode] = useState(defaultCode);

	const setPreviewFile = useSetAtom(previewCodeAtom);

	const executeRunCommand = useCallback(() => {
		setPreviewFile({
			id,
			code: defaultCode,
			execute: true,
		});
	}, [defaultCode, id, setPreviewFile]);

	useEffect(() => {
		if (monaco) {
			monaco?.editor.addEditorAction({
				id: 'run-python-code',
				label: 'Run Code',
				contextMenuOrder: 2,
				contextMenuGroupId: '1_modification',
				run: executeRunCommand,
			});
		}
	}, [executeRunCommand]);

	const editorRef = usePythonEditor({
		filepath: filePath,
		code,
		onChange: (newValue) => {
			setCode(newValue);
			updateCode(newValue);
		},
	});

	return <Box ref={editorRef} h="full" as="div" w="full" />;
};

export const FunctionEditor = ({ id }: any) => {
	const queryClient = useQueryClient();
	const { pageName, appName } = useAtomValue(pageAtom);
	const toast = useToast();
	const { pageId } = useParams();
	const { files } = useGetPage(pageId);

	const { files: workerFiles, isLoading: isLoadingWorkerFiles } = usePageFiles({
		pageName: pageName || '',
		appName: appName || '',
	});

	const file = files.find((f: any) => f.id === id);
	const fileName = file ? `${file?.name}${file?.type === 'sql' ? '.sql' : '.py'}` : null;

	const setPreviewFile = useSetAtom(previewCodeAtom);

	// ⚠️ check using / else will take files which ends with the same keywords like activate.py & deactivate.py
	const filePath = workerFiles.find((f: any) => f.endsWith(`/${fileName}`));
	const { isLoading, code, refetch } = useFile({
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

	const handleSave = () => {
		savePythonMutation.mutate({
			pageName,
			appName,
			fileName,
			sql: updatedCode,
			// source: selectedSource,
			fileId: id,
			fileType: file?.type,
		});
	};

	useEffect(() => {
		setCode(code);
	}, [id, code]);

	useEffect(() => {
		setPreviewFile({
			id,
			code,
			execute: false,
		});

		return () => {
			setPreviewFile({
				id: null,
				code: null,
				execute: false,
			});
		};
	}, [id, code, setPreviewFile]);

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
		file?.type === 'data_fetcher' || file?.type === 'ui'
			? !functionDeclarations.find((f) => f.name === file.name)
			: false;

	return (
		<Stack h="full" bg="white" spacing="0" divider={<Divider />} w="full">
			<Stack p="2" direction="row" alignItems="center" justifyContent="end">
				<Button
					w="fit-content"
					onClick={refetchColumns}
					variant="outline"
					colorScheme="gray"
					size="sm"
					isDisabled={code === updatedCode}
					leftIcon={<Save size="14" />}
				>
					Update
				</Button>
			</Stack>

			{!isLoadingWorkerFiles && updatedCode && isNotSameFunctionName ? (
				<Alert flexShrink="0" status="error">
					<AlertIcon />

					<AlertDescription>
						Please make sure function name matches with the file name
					</AlertDescription>
				</Alert>
			) : null}
			<Box overflowY="auto" h="full" pt="2">
				<PythonEditorLSP
					code={code}
					id={id}
					updateCode={setCode}
					filePath={filePath}
					key={id}
				/>
			</Box>
		</Stack>
	);
};
